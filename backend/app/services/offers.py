"""Server-side pricing + upsell selection. The client NEVER decides prices."""

from dataclasses import asdict, dataclass
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.order import OrderItemIn
from app.seed import ALL_SLUGS

# Post-checkout one-click upsell prices (docs/02 §3)
UPSELL_PRICE = {"kenidoux-calma": 199, "kenidoux-posta": 229, "kenidoux-lumba": 299}


class PricingError(ValueError):
    pass


@dataclass(frozen=True)
class UpsellOffer:
    product_slug: str
    title_ar: str
    headline_ar: str
    pitch_ar: str
    price_mad: int
    compare_at_mad: int

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


def products_in_items(items: list[dict]) -> set[str]:
    present: set[str] = set()
    for item in items:
        present.update(item.get("includes") or [item["product_slug"]])
    return present


def _calma() -> UpsellOffer:
    return UpsellOffer(
        product_slug="kenidoux-calma",
        title_ar="كينيدو كالما (جهاز الكاسات الحرارية الذكية)",
        headline_ar='زيد "كينيدو كالما" مع الكولية ديالك بـ 199 درهم فقط عوض 349 درهم!',
        pitch_ar=(
            "82% من الكليان اللي خداو منتجات كينيدو كيزيدو جهاز الكاسات الحراري الذكي باش يديرو "
            "جلسة استرخاء دافئة للكتاف والظهر فالليل (بلا جرح وبلا مصاريف توصيل إضافية — كيجيك فنفس الكولية!)."
        ),
        price_mad=UPSELL_PRICE["kenidoux-calma"],
        compare_at_mad=349,
    )


def _posta() -> UpsellOffer:
    return UpsellOffer(
        product_slug="kenidoux-posta",
        title_ar="كينيدو بوسطا (باقة مصحح الوقفة الذكي + وسادة الرقبة)",
        headline_ar='فرصة وحيدة: زيد باقة "كينيدو بوسطا" لراحة الرقبة والوقفة بـ 229 درهم فقط!',
        pitch_ar=(
            "كمّل راحة جسمك بمصحح الوقفة الذكي ووسادة التمدد العنقي — كيجيو معاك فنفس الكولية "
            "وبلا أي مصاريف توصيل إضافية، وبثمن خاص ما كيتعاودش."
        ),
        price_mad=UPSELL_PRICE["kenidoux-posta"],
        compare_at_mad=379,
    )


def _lumba_gift() -> UpsellOffer:
    return UpsellOffer(
        product_slug="kenidoux-lumba",
        title_ar="قطعة إضافية من كينيدو لومبا كهدية للوالدين",
        headline_ar='زيد قطعة إضافية من "كينيدو لومبا" هدية للوالدين بـ 299 درهم فقط!',
        pitch_ar=(
            "أحسن هدية لـ Lwalid أو Lwalida: حزام كينيدو لومبا إضافي بنفس الشحنة، "
            "مع المضخة ووصلة التوسيع المجانية، وبخصم 200 درهم على الثمن العادي."
        ),
        price_mad=UPSELL_PRICE["kenidoux-lumba"],
        compare_at_mad=499,
    )


def upsell_choices(items: list[dict]) -> list[UpsellOffer]:
    """Products missing from the box, at the post-checkout price. One gift Lumba if nothing is missing."""
    present = products_in_items(items)
    choices: list[UpsellOffer] = []
    if "kenidoux-calma" not in present:
        choices.append(_calma())
    if "kenidoux-posta" not in present:
        choices.append(_posta())
    if not choices:
        choices.append(_lumba_gift())
    return choices


def recommend_upsell(items: list[dict]) -> UpsellOffer:
    return upsell_choices(items)[0]


def resolve_upsell(items: list[dict], slug: str | None) -> UpsellOffer:
    """The shopper may pick one of the offered slugs. Any other slug falls back to the first offer."""
    choices = upsell_choices(items)
    if slug:
        match = next((offer for offer in choices if offer.product_slug == slug), None)
        if match is not None:
            return match
    return choices[0]


def price_items(db: Session, items_in: list[OrderItemIn]) -> list[dict]:
    """Resolve client-sent (slug, offer_id, qty) into trusted priced line items."""
    slugs = {i.product_slug for i in items_in}
    products = {
        p.slug: p for p in db.scalars(select(Product).where(Product.slug.in_(slugs), Product.is_active.is_(True)))
    }
    priced: list[dict] = []
    for item in items_in:
        product = products.get(item.product_slug)
        if product is None:
            raise PricingError(f"منتج غير متوفر: {item.product_slug}")

        if item.is_cross_sell or item.offer_id.startswith("crosssell-"):
            priced.append(
                {
                    "product_slug": product.slug,
                    "offer_id": f"crosssell-{product.slug}",
                    "title_ar": f"{product.name_ar} — عرض تكميلي",
                    "quantity": item.quantity,
                    "units": 1,
                    "price_mad": product.cross_sell_price_mad,
                    "compare_at_mad": product.base_price_mad,
                    "includes": [product.slug],
                    "is_cross_sell": True,
                    "is_upsell": False,
                }
            )
            continue

        offer = next((o for o in product.offers_json if o["id"] == item.offer_id), None)
        if offer is None:
            raise PricingError(f"عرض غير صالح: {item.offer_id}")
        priced.append(
            {
                "product_slug": product.slug,
                "offer_id": offer["id"],
                "title_ar": f"{product.name_ar} — {offer['title_ar']}",
                "quantity": item.quantity,
                "units": offer["quantity"],
                "price_mad": offer["price_mad"],
                "compare_at_mad": offer["compare_at_mad"],
                "includes": offer.get("includes") or [product.slug],
                "is_cross_sell": False,
                "is_upsell": False,
            }
        )
    return priced


def upsell_line_item(offer: UpsellOffer, product_names: dict[str, str]) -> dict:
    name = product_names.get(offer.product_slug, offer.product_slug)
    return {
        "product_slug": offer.product_slug,
        "offer_id": f"upsell-{offer.product_slug.removeprefix('kenidoux-')}",
        "title_ar": f"{name} — عرض VIP بعد الطلب",
        "quantity": 1,
        "units": 1,
        "price_mad": offer.price_mad,
        "compare_at_mad": offer.compare_at_mad,
        "includes": [offer.product_slug],
        "is_cross_sell": False,
        "is_upsell": True,
    }


__all__ = [
    "ALL_SLUGS",
    "PricingError",
    "UpsellOffer",
    "price_items",
    "recommend_upsell",
    "resolve_upsell",
    "upsell_choices",
    "upsell_line_item",
]
