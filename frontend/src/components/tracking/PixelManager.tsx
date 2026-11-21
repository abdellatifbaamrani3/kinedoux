"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

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
  }, [pathname]);

  return null;
}
