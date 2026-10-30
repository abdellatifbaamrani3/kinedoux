"""Moroccan (+212) and Saudi (+966) mobile normalizer. Mirrors frontend/src/lib/phone.ts."""

import re
from dataclasses import dataclass

_ARABIC_INDIC = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")
_PERSIAN = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")
_STRIP = re.compile(r"[\s\-\(\)\.]")

_KSA = re.compile(r"^(?:\+?966|00966|0)?(5[0-9]{8})$")
_MA = re.compile(r"^(?:\+?212|00212|0)?([67][0-9]{8})$")

ERROR_BOTH = "يرجى إدخال رقم هاتف صحيح مكون من 10 أرقام (مثال: 0612345678 أو 0512345678)"
ERROR_KSA = "يرجى إدخال رقم جوال سعودي صحيح (مثال: 0512345678)"


@dataclass(frozen=True)
class PhoneResult:
    is_valid: bool
    country: str | None = None  # "SA" | "MA"
    e164_with_plus: str = ""  # TikTok web + TikTok CAPI  (+212612345678)
    digits_no_plus: str = ""  # Meta CAPI + Snapchat CAPI (212612345678)
    local_display: str = ""  # 0612345678
    error_message: str | None = None


def normalize_digits(value: str) -> str:
    return _STRIP.sub("", value.strip().translate(_ARABIC_INDIC).translate(_PERSIAN))


def validate_and_format_phone(raw: str, mode: str = "BOTH") -> PhoneResult:
    mode = (mode or "BOTH").upper()
    cleaned = normalize_digits(raw or "")

    if mode in ("KSA", "BOTH"):
        m = _KSA.match(cleaned)
        if m:
            sub = m.group(1)
            return PhoneResult(True, "SA", f"+966{sub}", f"966{sub}", f"0{sub}")

    if mode in ("MA", "BOTH"):
        m = _MA.match(cleaned)
        if m:
            sub = m.group(1)
            return PhoneResult(True, "MA", f"+212{sub}", f"212{sub}", f"0{sub}")

    return PhoneResult(
        False,
        local_display=cleaned,
        error_message=ERROR_KSA if mode == "KSA" else ERROR_BOTH,
    )
