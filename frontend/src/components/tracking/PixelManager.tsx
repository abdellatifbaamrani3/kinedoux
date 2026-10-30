"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { captureAttribution, schedulePixelLoad, trackEvent } from "@/lib/tracking";

export function PixelManager() {
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution();
    return schedulePixelLoad();
  }, []);

  useEffect(() => {
    captureAttribution();
    trackEvent("PageView");
  }, [pathname]);

  return null;
}
