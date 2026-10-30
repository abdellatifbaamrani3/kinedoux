"""Seed / refresh the 3 core KINÉDOUX™ products. Runs on every container start (idempotent)."""

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
        "compare_price_mad": 699,
        "cross_sell_price_mad": 379,
        "stock_count": 7,
        "offers_json": [
            {
                "id": "lumba-1",
                "title_ar": "عرض التجربة الفردي (حزام واحد)",
                "subtitle_ar": "حزام كينيدو لومبا + المضخة + وصلة التوسيع + التوصيل المجاني",
                "quantity": 1,
                "price_mad": 499,
                "compare_at_mad": 699,
                "badge_ar": "توصيل مجاني",
                "is_default": False,
            },
            {
                "id": "lumba-2",
                "title_ar": "عرض العائلة والوالدين (حزامين 2x)",
                "subtitle_ar": "واحد ليك وواحد للواليد أو الواليدة — أحسن هدية لراحة الظهر (التاني بـ 350 د.م فقط!)",
                "quantity": 2,
                "price_mad": 849,
                "compare_at_mad": 1398,
                "badge_ar": "⭐ الأكثر طلباً — وفّر 549 د.م",
                "is_default": True,
            },
            {
                "id": "lumba-3",
                "title_ar": "الباقة الملكية للعائلة (3 أحزمة 3x)",
                "subtitle_ar": "توفير استثنائي للعائلة كاملة + أولوية الشحن السريع VIP",
                "quantity": 3,
                "price_mad": 1149,
                "compare_at_mad": 2097,
                "badge_ar": "💎 أقصى توفير — وفّر 948 د.م",
                "is_default": False,
            },
        ],
    },
    {
        "slug": "kenidoux-posta",
        "name_ar": "كينيدو بوسطا",
        "name_en": "Kinédoux Posta™",
        "base_price_mad": 379,
        "compare_price_mad": 549,
        "cross_sell_price_mad": 249,
        "stock_count": 9,
        "offers_json": [
            {
                "id": "posta-1",
                "title_ar": "باقة كينيدو بوسطا الفردية (1x)",
                "subtitle_ar": "مصحح الوقفة الذكي + وسادة تمديد الرقبة + برنامج 14 يوم + توصيل مجاني",
                "quantity": 1,
                "price_mad": 379,
                "compare_at_mad": 549,
                "badge_ar": "توصيل مجاني",
                "is_default": False,
            },
            {
                "id": "posta-2",
                "title_ar": "الباقة الثنائية للزوجين والعائلة (2x)",
                "subtitle_ar": "باقتين (ليك ولشريك حياتك أو ولدك/بنتك مع القراية والخدمة) — التانية بـ 270 د.م فقط!",
                "quantity": 2,
                "price_mad": 649,
                "compare_at_mad": 1098,
                "badge_ar": "⭐ الأكثر طلباً — وفّر 449 د.م",
                "is_default": True,
            },
            {
                "id": "posta-3",
                "title_ar": "باقة العائلة والمكتب (3x)",
                "subtitle_ar": "3 باقات متكاملة بسعر تفضيلي خاص + شحن مجاني سريع",
                "quantity": 3,
                "price_mad": 899,
                "compare_at_mad": 1647,
                "badge_ar": "💎 أقصى توفير — وفّر 748 د.م",
                "is_default": False,
            },
        ],
    },
    {
        "slug": "kenidoux-calma",
        "name_ar": "كينيدو كالما",
        "name_en": "Kinédoux Calma™",
        "base_price_mad": 349,
        "compare_price_mad": 499,
        "cross_sell_price_mad": 199,
        "stock_count": 6,
        "offers_json": [
            {
                "id": "calma-1",
                "title_ar": "جهاز كينيدو كالما الفردي (1x)",
                "subtitle_ar": "جهاز الكاسات الذكي + حقيبة الحفظ + كابل USB-C + التوصيل المجاني",
                "quantity": 1,
                "price_mad": 349,
                "compare_at_mad": 499,
                "badge_ar": "توصيل مجاني",
                "is_default": False,
            },
            {
                "id": "calma-2",
                "title_ar": "الباقة المزدوجة للتدليك المتزامن (2x)",
                "subtitle_ar": "جهازين للاستعمال في نفس الوقت على الكتفين الأيمن والأيسر (أو هدية للوالدين) — التاني بـ 250 د.م فقط!",
                "quantity": 2,
                "price_mad": 599,
                "compare_at_mad": 998,
                "badge_ar": "⭐ الأكثر طلباً — وفّر 399 د.م",
                "is_default": True,
            },
            {
                "id": "calma-3",
                "title_ar": "باقة كينيدو الشاملة (لومبا + بوسطا + كالما)",
                "subtitle_ar": "الترسانة الكاملة لراحة الظهر، الوقفة واسترخاء العضلات فالمغرب",
                "quantity": 3,
                "price_mad": 890,
                "compare_at_mad": 1427,
                "badge_ar": "👑 الباقة المتكاملة — وفّر 537 د.م",
                "is_default": False,
                "includes": ALL_SLUGS,
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
