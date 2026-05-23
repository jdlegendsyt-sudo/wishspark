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

// FIX 6: Festival paths — runtime-ൽ generate ചെയ്യുന്നു (dynamic safe)
const festivalPaths = new Set(festivals.map((festival) => `/${festival.slug}`));

const isAdEligiblePath = (pathname: string) => {
  if (pathname.startsWith("/blog/")) return true;

  // FIX 2: Tools pages-ലും ads ON ആക്കി — revenue maximize ചെയ്യുക
  // TOOL_MID, TOOL_BOTTOM slots .env-ൽ configure ചെയ്യുക
  if (pathname.startsWith("/tools/")) return true;

  // Festival pages-ൽ ads — highest traffic pages!
  if (festivalPaths.has(pathname)) return true;

  return ALLOWED_AD_PATHS.has(pathname);
};

// FIX 3: adSlot + pathname combination key — double push തടയുക
const getAdKey = (slot: string, pathname: string) => `${slot}::${pathname}`;

const AdBanner = ({ adSlot, adFormat = "auto", fullWidth = true, className = "" }: AdBannerProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef<string>(""); // pushed key store ചെയ്യുന്നു — boolean-ൽ നിന്ന് string-ലേക്ക് മാറ്റി
  const resolvedAdSlot = resolveAdSlot(adSlot);
  const location = useLocation();

  const allowAdsOnPath = isAdEligiblePath(location.pathname);

  // FIX 3: SPA route change — key-based push tracking (double push 100% prevent)
  useEffect(() => {
    if (!allowAdsOnPath || !resolvedAdSlot) return;

    const currentKey = getAdKey(resolvedAdSlot, location.pathname);

    // ഇതേ slot + path combination ഒരിക്കൽ push ചെയ്തിട്ടുണ്ടെങ്കിൽ skip ചെയ്യുക
    if (pushed.current === currentKey) return;

    const pushAd = () => {
      try {
        // FIX 5: Push ചെയ്യുന്നതിന് മുമ്പ് ins element reset ആയോ എന്ന് check ചെയ്യുക
        const insEl = adRef.current?.querySelector("ins.adsbygoogle");
        if (insEl && insEl.getAttribute("data-adsbygoogle-status")) {
          // Already initialized — skip to avoid double push
          return;
        }
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = currentKey;
      } catch (e) {
        console.error("AdSense push error:", e);
      }
    };

    if (window.adsbygoogle) {
      pushAd();
    } else {
      // FIX 5: Race condition fix — isMounted flag ഉപയോഗിക്കുക
      let attempts = 0;
      let isMounted = true;

      const interval = setInterval(() => {
        if (!isMounted) {
          clearInterval(interval);
          return;
        }
        attempts++;
        if (window.adsbygoogle) {
          pushAd();
          clearInterval(interval);
        } else if (attempts >= 25) {
          // 7.5 seconds കഴിഞ്ഞാൽ stop (25 × 300ms)
          clearInterval(interval);
        }
      }, 300);

      return () => {
        isMounted = false;
        clearInterval(interval);
      };
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
          // FIX 4: CLS fix — proper minHeight per format
          // auto format-ൽ 100px (mobile: 50px adaptive), horizontal: 90px, rectangle: 250px, vertical: 600px
          minHeight:
            adFormat === "vertical"
              ? "600px"
              : adFormat === "rectangle"
              ? "250px"
              : adFormat === "horizontal"
              ? "90px"
              : "100px", // "auto" format — 100px is safe baseline
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
