import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { festivals } from "@/data/festivals";

const tools = [
  { to: "/tools/birthday-wishes-generator", label: "🎂 Birthday Wishes" },
  { to: "/tools/birthday-card-maker", label: "🎨 Birthday Card Maker" },
  { to: "/tools/age-calculator", label: "🧮 Age Calculator" },
  { to: "/tools/birthday-countdown", label: "⏳ Birthday Countdown" },
  { to: "/tools/love-calculator", label: "💕 Love Calculator" },
  { to: "/tools/crush-calculator", label: "🔥 Crush Calculator" },
  { to: "/tools/couple-name-generator", label: "💑 Couple Names" },
  { to: "/tools/friendship-calculator", label: "👯 Friendship Calculator" },
  { to: "/tools/qr-code-generator", label: "🔳 QR Code Generator" },
  { to: "/tools/qr-code-scanner", label: "📷 QR Code Scanner" },
  { to: "/tools/instagram-hashtag-generator", label: "#️⃣ Instagram Hashtag Generator" },
  { to: "/tools/emi-calculator", label: "💳 EMI Calculator" },
];

const Header = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [festivalOpen, setFestivalOpen] = useState(false);
  const [desktopToolsOpen, setDesktopToolsOpen] = useState(false);
  const [desktopFestivalOpen, setDesktopFestivalOpen] = useState(false);

  const festivalMenuRef = useRef<HTMLDivElement | null>(null);
  const toolsMenuRef = useRef<HTMLDivElement | null>(null);

  const closeAllMenus = () => {
    setMobileOpen(false);
    setFestivalOpen(false);
    setToolsOpen(false);
    setDesktopFestivalOpen(false);
    setDesktopToolsOpen(false);
  };

  useEffect(() => {
    closeAllMenus();
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedFestival = festivalMenuRef.current?.contains(target);
      const clickedTools = toolsMenuRef.current?.contains(target);

      if (!clickedFestival) setDesktopFestivalOpen(false);
      if (!clickedTools) setDesktopToolsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDesktopFestivalOpen(false);
        setDesktopToolsOpen(false);
      }
    };

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-gold/20">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-lg bg-gold-gradient flex items-center justify-center shadow-gold">
            <span aria-hidden="true" className="text-lg text-primary-foreground">🎁</span>
          </div>
          <span className="text-xl font-display font-bold text-gold-gradient">WishSpark</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
          <div
            ref={festivalMenuRef}
            className="relative"
            onMouseEnter={() => setDesktopFestivalOpen(true)}
            onMouseLeave={() => setDesktopFestivalOpen(false)}
          >
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              aria-expanded={desktopFestivalOpen}
              aria-controls="desktop-festival-menu"
              onClick={() => {
                setDesktopFestivalOpen((prev) => !prev);
                setDesktopToolsOpen(false);
              }}
            >
              Festival Wishes <span aria-hidden="true">▾</span>
            </button>
            <div
              id="desktop-festival-menu"
              className={`absolute top-full left-0 pt-2 transition-all duration-200 ${desktopFestivalOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
            >
              <div className="bg-card border border-gold/20 rounded-xl shadow-xl p-2 min-w-[250px] max-h-[380px] overflow-y-auto">
                {festivals.map((festival) => (
                  <Link
                    key={festival.slug}
                    to={`/${festival.slug}`}
                    onClick={closeAllMenus}
                    className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    {festival.emoji} {festival.name} Wishes
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div
            ref={toolsMenuRef}
            className="relative"
            onMouseEnter={() => setDesktopToolsOpen(true)}
            onMouseLeave={() => setDesktopToolsOpen(false)}
          >
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              aria-expanded={desktopToolsOpen}
              aria-controls="desktop-tools-menu"
              onClick={() => {
                setDesktopToolsOpen((prev) => !prev);
                setDesktopFestivalOpen(false);
              }}
            >
              Tools <span aria-hidden="true">▾</span>
            </button>
            <div
              id="desktop-tools-menu"
              className={`absolute top-full left-0 pt-2 transition-all duration-200 ${desktopToolsOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
            >
              <div className="bg-card border border-gold/20 rounded-xl shadow-xl p-2 min-w-[220px] max-h-[420px] overflow-y-auto">
                {tools.map((t) => (
                  <Link
                    key={t.to}
                    to={t.to}
                    onClick={closeAllMenus}
                    className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link>
          <Link to="/authors" className="text-sm text-muted-foreground hover:text-primary transition-colors">Authors</Link>
          <Link to="/editorial-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Editorial Policy</Link>
          <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">How It Works</Link>
          <Link to="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
          <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</Link>
          <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden text-foreground"
          aria-expanded={mobileOpen}
          aria-controls="mobile-main-nav"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <span aria-hidden="true" className="text-2xl leading-none">{mobileOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gold/10 bg-card">
          <nav id="mobile-main-nav" className="container mx-auto px-4 py-4 space-y-1">
            <Link to="/" onClick={closeAllMenus} className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary rounded-lg">Home</Link>
            <button
              type="button"
              onClick={() => setFestivalOpen((prev) => !prev)}
              aria-expanded={festivalOpen}
              className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-primary rounded-lg flex items-center justify-between"
            >
              <span>Festival Wishes</span>
              <span aria-hidden="true" className={`transition-transform ${festivalOpen ? "rotate-180" : ""}`}>▾</span>
            </button>
            {festivalOpen && (
              <div className="pl-4 space-y-1 max-h-[260px] overflow-y-auto">
                {festivals.map((festival) => (
                  <Link key={festival.slug} to={`/${festival.slug}`} onClick={closeAllMenus} className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary rounded-lg">
                    {festival.emoji} {festival.name} Wishes
                  </Link>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setToolsOpen((prev) => !prev)}
              aria-expanded={toolsOpen}
              className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-primary rounded-lg flex items-center justify-between"
            >
              <span>Tools</span>
              <span aria-hidden="true" className={`transition-transform ${toolsOpen ? "rotate-180" : ""}`}>▾</span>
            </button>
            {toolsOpen && (
              <div className="pl-4 space-y-1">
                {tools.map((t) => (
                  <Link key={t.to} to={t.to} onClick={closeAllMenus} className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary rounded-lg">
                    {t.label}
                  </Link>
                ))}
              </div>
            )}
            {[
              { to: "/blog", label: "Blog" },
              { to: "/authors", label: "Authors" },
              { to: "/editorial-policy", label: "Editorial Policy" },
              { to: "/how-it-works", label: "How It Works" },
              { to: "/faq", label: "FAQ" },
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
            ].map((link) => (
              <Link key={link.to} to={link.to} onClick={closeAllMenus} className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary rounded-lg">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
