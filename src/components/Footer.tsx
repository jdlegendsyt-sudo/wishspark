import { Link } from "react-router-dom";
import { Gift, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-gold/10 bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center">
                <Gift className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-display font-bold text-gold-gradient">WishSpark</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Create and share beautiful festival greetings with your loved ones. Spread joy with personalized wishes!
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/authors" className="text-sm text-muted-foreground hover:text-primary transition-colors">Authors</Link></li>
              <li><Link to="/editorial-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Editorial Policy</Link></li>
              <li><Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link to="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/sitemap" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sitemap</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Fun Tools</h4>
            <ul className="space-y-2">
              <li><Link to="/tools/birthday-wishes-generator" className="text-sm text-muted-foreground hover:text-primary transition-colors">Birthday Wishes</Link></li>
              <li><Link to="/tools/birthday-card-maker" className="text-sm text-muted-foreground hover:text-primary transition-colors">Birthday Card Maker</Link></li>
              <li><Link to="/tools/age-calculator" className="text-sm text-muted-foreground hover:text-primary transition-colors">Age Calculator</Link></li>
              <li><Link to="/tools/birthday-countdown" className="text-sm text-muted-foreground hover:text-primary transition-colors">Birthday Countdown</Link></li>
              <li><Link to="/tools/love-calculator" className="text-sm text-muted-foreground hover:text-primary transition-colors">Love Calculator</Link></li>
              <li><Link to="/tools/crush-calculator" className="text-sm text-muted-foreground hover:text-primary transition-colors">Crush Calculator</Link></li>
              <li><Link to="/tools/couple-name-generator" className="text-sm text-muted-foreground hover:text-primary transition-colors">Couple Name Generator</Link></li>
              <li><Link to="/tools/friendship-calculator" className="text-sm text-muted-foreground hover:text-primary transition-colors">Friendship Calculator</Link></li>
              <li><Link to="/tools/qr-code-generator" className="text-sm text-muted-foreground hover:text-primary transition-colors">QR Code Generator</Link></li>
              <li><Link to="/tools/qr-code-scanner" className="text-sm text-muted-foreground hover:text-primary transition-colors">QR Code Scanner</Link></li>
              <li><Link to="/tools/instagram-hashtag-generator" className="text-sm text-muted-foreground hover:text-primary transition-colors">Instagram Hashtag Generator</Link></li>
              <li><Link to="/tools/emi-calculator" className="text-sm text-muted-foreground hover:text-primary transition-colors">EMI Calculator</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Popular Wishes</h4>
            <ul className="space-y-2">
              <li><Link to="/onam-wishes" className="text-sm text-muted-foreground hover:text-primary transition-colors">Onam Wishes</Link></li>
              <li><Link to="/christmas-wishes" className="text-sm text-muted-foreground hover:text-primary transition-colors">Christmas Wishes</Link></li>
              <li><Link to="/diwali-wishes" className="text-sm text-muted-foreground hover:text-primary transition-colors">Diwali Wishes</Link></li>
              <li><Link to="/birthday-wishes" className="text-sm text-muted-foreground hover:text-primary transition-colors">Birthday Wishes</Link></li>
              <li><Link to="/new-year-wishes" className="text-sm text-muted-foreground hover:text-primary transition-colors">New Year Wishes</Link></li>
              <li><Link to="/eid-mubarak-wishes" className="text-sm text-muted-foreground hover:text-primary transition-colors">Eid Mubarak Wishes</Link></li>
              <li><Link to="/holi-wishes" className="text-sm text-muted-foreground hover:text-primary transition-colors">Holi Wishes</Link></li>
              <li><Link to="/raksha-bandhan-wishes" className="text-sm text-muted-foreground hover:text-primary transition-colors">Raksha Bandhan Wishes</Link></li>
              <li><Link to="/valentines-day-wishes" className="text-sm text-muted-foreground hover:text-primary transition-colors">Valentine's Day Wishes</Link></li>
              <li><Link to="/mothers-day-wishes" className="text-sm text-muted-foreground hover:text-primary transition-colors">Mother's Day Wishes</Link></li>
              <li><Link to="/fathers-day-wishes" className="text-sm text-muted-foreground hover:text-primary transition-colors">Father's Day Wishes</Link></li>
              <li><Link to="/independence-day-wishes" className="text-sm text-muted-foreground hover:text-primary transition-colors">Independence Day</Link></li>
              <li><Link to="/thanksgiving-wishes" className="text-sm text-muted-foreground hover:text-primary transition-colors">Thanksgiving Wishes</Link></li>
              <li><Link to="/vishu-wishes" className="text-sm text-muted-foreground hover:text-primary transition-colors">Vishu Wishes</Link></li>
              <li><Link to="/navratri-wishes" className="text-sm text-muted-foreground hover:text-primary transition-colors">Navratri Wishes</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Use</Link></li>
              <li><Link to="/disclaimer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Disclaimer</Link></li>
              <li><Link to="/editorial-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Editorial Policy</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gold/10 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              Free to use, forever
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
              No signup required
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-400"></span>
              No data stored on servers
            </span>
            <a href="mailto:support@wishspark.xyz" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
              support@wishspark.xyz
            </a>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} WishSpark. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-accent fill-accent" /> for spreading joy
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
