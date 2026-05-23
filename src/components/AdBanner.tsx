import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { festivals } from "@/data/festivals";

interface AdBannerProps {
  adSlot: string;
  adFormat?: "auto" | "horizontal" | "vertical" | "rectangle";
  fullWidth?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

const AD_SLOT_ENV_MAP: Record<string, string | undefined> = {
  HOME_MID_SLOT: import.meta.env.VITE_AD_SLOT_HOME_MID,
  HOME_BOTTOM_SLOT: import.meta.env.VITE_AD_SLOT_HOME_BOTTOM,
  BLOG_TOP_SLOT: import.meta.env.VITE_AD_SLOT_BLOG_TOP,
  BLOG_BOTTOM_SLOT: import.meta.env.VITE_AD_SLOT_BLOG_BOTTOM,
  BLOG_POST_TOP: import.meta.env.VITE_AD_SLOT_BLOG_POST_TOP,
  BLOG_POST_BOTTOM: import.meta.env.VITE_AD_SLOT_BLOG_POST_BOTTOM,
  FESTIVAL_TOP: import.meta.env.VITE_AD_SLOT_FESTIVAL_TOP,
  FESTIVAL_MID: import.meta.env.VITE_AD_SLOT_FESTIVAL_MID,
  TOOL_MID: import.meta.env.VITE_AD_SLOT_TOOL_MID,
  TOOL_BOTTOM: import.meta.env.VITE_AD_SLOT_TOOL_BOTTOM,
};

const isNumericSlot = (slot: string) => /^\d+$/.test(slot);

const resolveAdSlot = (slot: string) => {
  if (isNumericSlot(slot)) return slot;
  const mapped = AD_SLOT_ENV_MAP[slot];
  return mapped && isNumericSlot(mapped) ? mapped : "";
};

const ALLOWED_AD_PATHS = new Set([
  "/",
  "/blog",
  "/about",
  "/authors",
  "/editorial-policy",
  "/faq",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/disclaimer",
  "/sitemap",
  "/how-it-works",
]);

const festivalPaths = new Set(festivals.map((festival) => `/${festival.slug}`));

const isAdEligiblePath = (pathname: string) => {
  if (pathname.startsWith("/blog/")) return true;
  // ✅ FIX: Tools pages-ൽ മാത്രം ads OFF, festival pages-ൽ ON
  if (pathname.startsWith("/tools/")) return false;
  // ✅ FIX: Festival pages-ൽ ads enable - ഇതാണ് ഏറ്റവും കൂടുതൽ traffic!
  if (festivalPaths.has(pathname)) return true;
  return ALLOWED_AD_PATHS.has(pathname);
};

const AdBanner = ({ adSlot, adFormat = "auto", fullWidth = true, className = "" }: AdBannerProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const resolvedAdSlot = resolveAdSlot(adSlot);
  const location = useLocation();

  // ✅ FIX: Route change ആകുമ്പോൾ pushed reset ചെയ്യുക (SPA fix)
  useEffect(() => {
    pushed.current = false;
  }, [location.pathname]);

  // ✅ FIX: Cookie consent check - declined ആയാലും non-personalized ads കാണിക്കും
  // Google Consent Mode v2 handle ചെയ്യുന്നത് index.html-ൽ ആണ്
  const allowAdsOnPath = isAdEligiblePath(location.pathname);

  useEffect(() => {
    if (pushed.current || !allowAdsOnPath || !resolvedAdSlot) return;

    // ✅ FIX: Retry mechanism - script load ആകുന്നത് wait ചെയ്യുക
    const pushAd = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch (e) {
        console.error("AdSense push error:", e);
      }
    };

    if (window.adsbygoogle) {
      pushAd();
    } else {
      // Script load ആകുന്നത് wait ചെയ്ത് retry ചെയ്യുക
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.adsbygoogle) {
          pushAd();
          clearInterval(interval);
        } else if (attempts >= 20) {
          // 6 seconds കഴിഞ്ഞാൽ stop
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [allowAdsOnPath, resolvedAdSlot, location.pathname]);

  if (!allowAdsOnPath || !resolvedAdSlot) return null;

  return (
    <div className={`w-full flex justify-center ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: fullWidth ? "100%" : "auto",
          // ✅ FIX: minHeight add ചെയ്തു - CLS (Layout Shift) ഒഴിവാക്കാൻ
          minHeight: adFormat === "vertical" ? "600px" : adFormat === "rectangle" ? "250px" : "90px",
        }}
        data-ad-client="ca-pub-3907372619896669"
        data-ad-slot={resolvedAdSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
