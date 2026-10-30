from pydantic import BaseModel, ConfigDict


class OfferOut(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    title_ar: str
    subtitle_ar: str
    quantity: int
    price_mad: int
    compare_at_mad: int
    badge_ar: str
    is_default: bool = False


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    slug: str
    name_ar: str
    name_en: str
    base_price_mad: int
    compare_price_mad: int
    cross_sell_price_mad: int
    stock_count: int
    offers_json: list[OfferOut]
    is_active: bool
