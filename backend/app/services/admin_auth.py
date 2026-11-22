"""Admin password and session. The browser never sees the password hash."""

import hashlib
import hmac
import logging
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models.admin import AdminSession, AdminUser

log = logging.getLogger("kenidoux.admin")

PBKDF2_ROUNDS = 210_000
SESSION_DAYS = 14
_ATTEMPTS: dict[str, list[datetime]] = {}
MAX_ATTEMPTS = 8
WINDOW = timedelta(minutes=15)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ROUNDS)
    return f"pbkdf2_sha256${PBKDF2_ROUNDS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        scheme, rounds, salt_hex, digest_hex = stored.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        salt = bytes.fromhex(salt_hex)
        digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, int(rounds))
        return hmac.compare_digest(digest.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def too_many_attempts(ip: str) -> bool:
    now = _now()
    recent = [stamp for stamp in _ATTEMPTS.get(ip, []) if now - stamp < WINDOW]
    _ATTEMPTS[ip] = recent
    return len(recent) >= MAX_ATTEMPTS


def record_attempt(ip: str) -> None:
    _ATTEMPTS.setdefault(ip, []).append(_now())


def clear_attempts(ip: str) -> None:
    _ATTEMPTS.pop(ip, None)


def ensure_admin(db: Session) -> None:
    email = settings.ADMIN_EMAIL.strip().lower()
    password = settings.ADMIN_PASSWORD
    if not email or not password:
        log.warning("ADMIN_EMAIL or ADMIN_PASSWORD is empty. Admin login is closed.")
        return
    if len(password) < 10:
        log.warning("ADMIN_PASSWORD must be at least 10 characters. Admin login is closed.")
        return
    user = db.scalar(select(AdminUser).where(AdminUser.email == email))
    if user is None:
        db.add(AdminUser(email=email, password_hash=hash_password(password)))
    elif not verify_password(password, user.password_hash):
        user.password_hash = hash_password(password)
    db.commit()


def authenticate(db: Session, email: str, password: str) -> AdminUser | None:
    user = db.scalar(select(AdminUser).where(AdminUser.email == email.strip().lower()))
    if user is None or not verify_password(password, user.password_hash):
        return None
    return user


def start_session(db: Session, user: AdminUser) -> str:
    token = secrets.token_urlsafe(32)
    db.add(
        AdminSession(
            user_id=user.id,
            token_hash=token_hash(token),
            expires_at=_now() + timedelta(days=SESSION_DAYS),
        )
    )
    db.commit()
    return token


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def user_for_token(db: Session, token: str | None) -> AdminUser | None:
    if not token:
        return None
    row = db.scalar(select(AdminSession).where(AdminSession.token_hash == token_hash(token)))
    if row is None or _as_utc(row.expires_at) < _now():
        return None
    return db.get(AdminUser, row.user_id)


def end_session(db: Session, token: str | None) -> None:
    if not token:
        return
    row = db.scalar(select(AdminSession).where(AdminSession.token_hash == token_hash(token)))
    if row is not None:
        db.delete(row)
        db.commit()


def bearer_token(header: str | None) -> str | None:
    if not header:
        return None
    scheme, _, value = header.partition(" ")
    if scheme.lower() != "bearer" or not value.strip():
        return None
    return value.strip()


def new_id() -> uuid.UUID:
    return uuid.uuid4()
