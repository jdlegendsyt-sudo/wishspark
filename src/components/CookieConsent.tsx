import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // FIX 7: 1500ms → 500ms ആക്കി
      // index.html-ൽ wait_for_update 2500ms ആണ്, അതിനുള്ളിൽ banner കാണിക്കണം
      // User-ന് consent ചെയ്യാൻ time കൊടുക്കുക — revenue maximize
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    // Consent Mode v2 — accept ചെയ്യുമ്പോൾ personalized ads enable
    window.gtag?.("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    });
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    // Decline ആയാലും ads കാണിക്കും — non-personalized mode
    // Google Consent Mode v2 default denied ആണ്
    // Ads show ആകും but personalization ഉണ്ടാകില്ല — policy compliant!
    window.gtag?.("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 25 }}
      className="fixed bottom-0 left-0 right-0 z-[100] p-4"
    >
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-4 md:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Cookie className="w-6 h-6 text-primary shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-xs md:text-sm text-muted-foreground flex-1">
          We use cookies to enhance your experience and serve relevant ads via Google AdSense.
          By clicking &quot;Accept&quot;, you consent to personalised ads and analytics.{" "}
          Declining shows non-personalised ads only.{" "}
          <Link to="/privacy-policy" className="text-primary underline">
            Privacy Policy
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={decline}>
            Decline
          </Button>
          <Button size="sm" onClick={accept} className="bg-primary text-primary-foreground">
            Accept
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CookieConsent;
