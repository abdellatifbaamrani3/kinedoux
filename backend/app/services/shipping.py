"""Shipping port. The desk updates status by hand until a carrier adapter is plugged in."""

from app.models.order import Order


class ShippingPort:
    def register_shipment(self, order: Order) -> str | None:
        """Return a carrier tracking number, or None when shipping stays manual."""
        return None


def get_shipping() -> ShippingPort:
    return ShippingPort()
