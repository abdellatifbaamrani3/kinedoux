"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { OrdersDesk } from "@/components/admin/OrdersDesk";

export default function OrdersPage() {
  return (
    <AdminShell>
      <OrdersDesk />
    </AdminShell>
  );
}
