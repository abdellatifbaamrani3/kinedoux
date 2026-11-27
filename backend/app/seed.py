"""Seed / refresh the KINÉDOUX™ catalogue. Runs on every container start (idempotent)."""

import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product

log = logging.getLogger("kenidoux.seed")

ALL_SLUGS = ["kenidoux-lumba", "kenidoux-posta", "kenidoux-calma"]

PRODUCT_SEED: list[dict] = [
    {
        "slug": "kenidoux-lumba",
        "name_ar": "كينيدو لومبا",
        "name_en": "Kinédoux Lumba™",
        "base_price_mad": 499,
        "compare_price_mad": 499,
        "cross_sell_price_mad": 379,
        "stock_count": 7,
        "offers_json": [
            {
                "id": "lumba-1",
                "title_ar": "عرض التجربة الفردي (حزام واحد)",
                "subtitle_ar": "حزام كينيدو لومبا + المضخة + وصلة التوسيع + التوصيل المجاني",
                "quantity": 1,
                "price_mad": 499,
                "compare_at_mad": 499,
                "badge_ar": "توصيل مجاني",
                "is_default": True,
            },
            {
                "id": "lumba-2",
                "title_ar": "حزامين — ليك وهدية للوالدين",
                "subtitle_ar": "واحد ليك وواحد للواليد أو الواليدة. التاني بـ 350 د.م بدل 499، ونفس الكولية.",
                "quantity": 2,
                "price_mad": 849,
                "compare_at_mad": 998,
                "badge_ar": "هدية للدار",
                "is_default": False,
            },
        ],
    },
    {
        "slug": "kenidoux-posta",
        "name_ar": "كينيدو بوسطا",
        "name_en": "Kinédoux Posta™",
        "base_price_mad": 379,
        "compare_price_mad": 379,
        "cross_sell_price_mad": 249,
        "stock_count": 9,
        "offers_json": [
            {
                "id": "posta-1",
                "title_ar": "باقة كينيدو بوسطا الفردية (1x)",
                "subtitle_ar": "مصحح الوقفة الذكي + وسادة تمديد الرقبة + برنامج 14 يوم + توصيل مجاني",
                "quantity": 1,
                "price_mad": 379,
                "compare_at_mad": 379,
                "badge_ar": "توصيل مجاني",
                "is_default": True,
            },
            {
                "id": "posta-2",
                "title_ar": "باقتين — ليك ولشريكك",
                "subtitle_ar": "للزوجين، أو ليك وولدك مع القراية. التانية بـ 270 د.م بدل 379، فنفس الكولية.",
                "quantity": 2,
                "price_mad": 649,
                "compare_at_mad": 758,
                "badge_ar": "هدية للدار",
                "is_default": False,
            },
        ],
    },
    {
        "slug": "kenidoux-calma",
        "name_ar": "كينيدو كالما",
        "name_en": "Kinédoux Calma™",
        "base_price_mad": 349,
        "compare_price_mad": 349,
        "cross_sell_price_mad": 199,
        "stock_count": 6,
        "offers_json": [
            {
                "id": "calma-1",
                "title_ar": "جهاز كينيدو كالما الفردي (1x)",
                "subtitle_ar": "جهاز الكاسات الذكي + حقيبة الحفظ + كابل USB-C + التوصيل المجاني",
                "quantity": 1,
                "price_mad": 349,
                "compare_at_mad": 349,
                "badge_ar": "توصيل مجاني",
                "is_default": True,
            },
            {
                "id": "calma-2",
                "title_ar": "جهازين — للكتفين أو هدية",
                "subtitle_ar": "واحد ليك وواحد للوالدين. التاني بـ 250 د.م بدل 349، فنفس الكولية.",
                "quantity": 2,
                "price_mad": 599,
                "compare_at_mad": 698,
                "badge_ar": "هدية للدار",
                "is_default": False,
            },
            {
                "id": "calma-3",
                "title_ar": "الباقة الكاملة (لومبا + بوسطا + كالما)",
                "subtitle_ar": "ظهر، وقفة واسترخاء فكولية واحدة. 890 عوض 1227 عند الشراء فرادى.",
                "quantity": 3,
                "price_mad": 890,
                "compare_at_mad": 1227,
                "badge_ar": "الباقة المتكاملة",
                "is_default": False,
                "includes": ALL_SLUGS,
            },
        ],
    },
    {
        # Alibaba 1601930656948: Chrome Alloy ABS Handheld Hands Massager.
        # Public copy stays on that title. No heat, modes, or battery are claimed.
        "slug": "kenidoux-palma",
        "name_ar": "كينيدو بالما",
        "name_en": "Kinédoux Palma™",
        "base_price_mad": 287,
        "compare_price_mad": 287,
        "cross_sell_price_mad": 199,
        "stock_count": 12,
        "offers_json": [
            {
                "id": "palma-1",
                "title_ar": "جهاز واحد",
                "subtitle_ar": "كينيدو بالما + التوصيل المجاني",
                "quantity": 1,
                "price_mad": 287,
                "compare_at_mad": 287,
                "badge_ar": "توصيل مجاني",
                "is_default": True,
            },
            {
                "id": "palma-2",
                "title_ar": "جهازين — ليك وللدار",
                "subtitle_ar": "واحد ليك وواحد للدار. التاني بـ 212 د.م بدل 287، فنفس الكولية.",
                "quantity": 2,
                "price_mad": 499,
                "compare_at_mad": 574,
                "badge_ar": "هدية للدار",
                "is_default": False,
            },
        ],
    },
]


def seed_initial_products(db: Session) -> None:
    """Insert missing products and refresh catalogue fields. `stock_count` is never overwritten."""
    for data in PRODUCT_SEED:
        product = db.scalar(select(Product).where(Product.slug == data["slug"]))
        if product is None:
            db.add(Product(**data, is_active=True))
            log.info("Seeded product %s", data["slug"])
            continue
        for field in (
            "name_ar",
            "name_en",
            "base_price_mad",
            "compare_price_mad",
            "cross_sell_price_mad",
            "offers_json",
        ):
            setattr(product, field, data[field])
        product.is_active = True
    db.commit()
