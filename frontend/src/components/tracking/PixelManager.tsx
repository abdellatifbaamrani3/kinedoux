"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { trackStore } from "@/lib/store-track";
import { captureAttribution, schedulePixelLoad, trackPageView } from "@/lib/tracking";

export function PixelManager() {
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution();
    return schedulePixelLoad();
  }, []);

  useEffect(() => {
    captureAttribution();
    trackPageView(pathname);
    trackStore("page_view");
  }, [pathname]);

  return null;
}
