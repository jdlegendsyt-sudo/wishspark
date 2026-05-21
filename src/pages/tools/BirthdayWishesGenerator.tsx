import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cake, Copy, Share2, RefreshCw, Link2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import SeoBreadcrumbs from "@/components/SeoBreadcrumbs";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import AdBanner from "@/components/AdBanner";
import JsonLd from "@/components/JsonLd";
import FaqAccordion from "@/components/FaqAccordion";
import RelatedToolsSection from "@/components/RelatedToolsSection";
import { smoothScrollToElement } from "@/lib/scrollToElement";

const wishes = [
  (n: string) => `💕 Happy Birthday, my dearest ${n}! You are the most precious gift in my life. Every moment with you feels like a beautiful dream. May your day be filled with all the love you deserve! 🎂✨`,
  (n: string) => `💖 ${n}, you make my heart skip a beat every single day. On your special day, I want you to know how deeply you are loved. Happy Birthday, my love! 🌹💫`,
  (n: string) => `🥰 To the one who holds my heart — Happy Birthday, ${n}! You are my sunshine, my happiness, and my everything. May this year bring you endless joy and all your heart desires! 💝`,
  (n: string) => `💗 ${n}, words cannot express how much you mean to me. You are my favorite person in this whole world. Wishing you the most magical birthday filled with love! 🎀✨`,
  (n: string) => `🌹 Happy Birthday to the most amazing soul, ${n}! Your smile is my favorite thing, and your happiness is all I wish for. I love you more than words can say! 💕🎂`,
  (n: string) => `💞 ${n}, every day with you is a blessing, and today we celebrate the day an angel was born. Happy Birthday, sweetheart! May all your dreams come true! 🌟💖`,
  (n: string) => `😘 To my beloved ${n} — Happy Birthday! You deserve all the love, happiness, and beautiful moments life has to offer. You are truly one in a million! 💝🎉`,
  (n: string) => `💓 ${n}, you light up my world like nobody else. On your birthday, I wish you infinite love, endless happiness, and a lifetime of beautiful memories! 🎂💕`,
  (n: string) => `🥹 Happy Birthday, precious ${n}! My heart overflows with love for you. Thank you for being you — the most wonderful person I know. May this year be your best yet! 💖✨`,
  (n: string) => `💘 ${n}, you are the reason I believe in magic. Happy Birthday to my favorite human! May your day be as extraordinary and beautiful as you are! 🌈💗`,
  (n: string) => `🌸 Wishing the happiest birthday to ${n}! You are loved beyond measure and cherished more than you know. Here's to another year of making beautiful memories together! 💕🎀`,
  (n: string) => `💝 ${n}, on your special day, I want you to feel all the love that surrounds you. You are a treasure, and the world is better because you're in it. Happy Birthday! 🎂💖`,
];

const BirthdayWishesGenerator = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [generated, setGenerated] = useState<string[]>([]);
  const [isSharedView, setIsSharedView] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const generate = () => {
    if (!name.trim()) return;
    const shuffled = [...wishes].sort(() => Math.random() - 0.5);
    setGenerated(shuffled.slice(0, 5).map((fn) => fn(name.trim())));
    setIsSharedView(false);
    setTimeout(() => smoothScrollToElement(resultsRef.current), 120);
  };

  const getShareLink = (wish?: string) => {
    const url = new URL(`${window.location.origin}/tools/birthday-wishes-generator`);
    url.searchParams.set("shared", "1");
    url.searchParams.set("name", name.trim());
    if (wish) {
      url.searchParams.set("wish", wish);
    }
    return url.toString();
  };

  const copyShareLink = async (wish: string) => {
    await navigator.clipboard.writeText(getShareLink(wish));
    toast({ title: "Link copied", description: "Share link is ready to send" });
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Wish copied to clipboard" });
  };

  const share = (text: string) => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${text}\n\nView this wish: ${getShareLink(text)}`)}`;
    window.open(url, "_blank");
  };

  const createYourOwn = () => {
    setSearchParams({});
    setName("");
    setGenerated([]);
    setIsSharedView(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const shared = searchParams.get("shared") === "1";
    if (!shared) {
      return;
    }

    const sharedName = searchParams.get("name") || "Friend";
    const sharedWish = searchParams.get("wish");

    setName(sharedName);
    if (sharedWish) {
      setGenerated([sharedWish]);
    } else {
      const shuffled = [...wishes].sort(() => Math.random() - 0.5);
      setGenerated(shuffled.slice(0, 5).map((fn) => fn(sharedName.trim())));
    }
    setIsSharedView(true);
    setTimeout(() => smoothScrollToElement(resultsRef.current), 120);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebApplication", "name": "Birthday Wishes with Name Generator", "url": "https://www.wishspark.xyz/tools/birthday-wishes-generator", "description": "Free birthday wishes generator with name. Create personalized happy birthday messages ready to share on WhatsApp & social media.", "applicationCategory": "EntertainmentApplication", "operatingSystem": "All", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }, "publisher": { "@type": "Organization", "name": "WishSpark" } }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "How to create birthday wishes with name?", "acceptedAnswer": { "@type": "Answer", "text": "Simply enter the birthday person's name and click Generate. Our tool creates multiple personalized birthday wishes with their name included, ready to copy and share!" }}, { "@type": "Question", "name": "Can I share birthday wishes on WhatsApp?", "acceptedAnswer": { "@type": "Answer", "text": "Yes! Each generated birthday wish has a WhatsApp share button. Click it to instantly send the personalized birthday message to your loved one." }}, { "@type": "Question", "name": "Are these birthday wishes free?", "acceptedAnswer": { "@type": "Answer", "text": "Absolutely! Our birthday wishes generator is 100% free with no signup required. Generate unlimited personalized birthday messages anytime." }}] }} />
      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <SeoBreadcrumbs
          items={[
            { label: "Tools", href: "/#fun-tools" },
            { label: "Birthday Wishes Generator" },
          ]}
        />
        <div className="text-center mb-8">
          <motion.div className="text-6xl mb-4" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>🎂</motion.div>
          <h1 className="text-4xl font-display font-bold text-gold-gradient mb-3">Birthday Wishes with Name Generator</h1>
          <p className="text-muted-foreground">Create personalized happy birthday wishes with name — unique, heartfelt birthday messages ready to share on WhatsApp & social media!</p>
        </div>

        <div className="bg-glass rounded-2xl p-6 border border-gold/20 shadow-gold mb-8">
          <label className="text-sm font-medium text-foreground block mb-2">Enter Birthday Person's Name</label>
          <div className="flex gap-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Arun" maxLength={50} className="bg-secondary/50 border-gold/20" />
            <Button onClick={generate} className="bg-gold-gradient text-primary-foreground hover:opacity-90 shrink-0">
              <Cake className="w-4 h-4 mr-2" /> Generate
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {generated.length > 0 && (
            <motion.div ref={resultsRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-2xl mx-auto mb-8 md:mb-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-semibold text-foreground">Your Wishes for {name}</h2>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={generate}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
                  {isSharedView && (
                    <Button size="sm" onClick={createYourOwn} className="bg-gold-gradient text-primary-foreground hover:opacity-90">
                      Create Your Own
                    </Button>
                  )}
                </div>
              </div>
              {generated.map((wish, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.12, type: "spring", stiffness: 100 }}
                  className="relative overflow-hidden rounded-2xl border border-gold/30 shadow-gold bg-gradient-to-br from-secondary/80 via-card to-secondary/60 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-gold/5" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient" />
                  <div className="relative p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="text-2xl">💕</span>
                      <p className="text-sm text-foreground leading-relaxed font-medium">{wish}</p>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-gold/10">
                      <Button variant="outline" size="sm" onClick={() => copy(wish)} className="border-gold/30 hover:bg-gold/10 hover:border-gold/50 transition-all">
                        <Copy className="w-3 h-3 mr-1" /> Copy
                      </Button>
                      <Button size="sm" onClick={() => share(wish)} className="bg-gold-gradient text-primary-foreground hover:opacity-90">
                        <Share2 className="w-3 h-3 mr-1" /> WhatsApp
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => copyShareLink(wish)} className="border-gold/30 hover:bg-gold/10 hover:border-gold/50 transition-all">
                        <Link2 className="w-3 h-3 mr-1" /> Share Link
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <section className="mb-8 bg-glass rounded-2xl p-6 border border-gold/10">
          <h2 className="text-lg font-display font-semibold text-foreground mb-3">Introduction</h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Writing birthday messages sounds easy until you need one that feels personal, appropriate, and distinct from generic forwards.
              Many users face this pressure when they need multiple greetings in a short time for friends, relatives, colleagues, or client
              contacts. This generator is designed to solve that practical problem by creating readable, name-personalized wishes that are
              ready for immediate use.
            </p>
            <p>
              Instead of producing a single repeated line, the tool offers multiple options with different tones so users can choose a
              message that fits the relationship. The output is structured for quick copy and one-click sharing, making it useful when
              timing matters. The overall goal is to help users communicate warmth and effort without requiring long writing sessions.
            </p>
            <p>
              This approach is valuable for both personal and semi-formal contexts. Users can generate refined text for close friends,
              family members, classmates, or colleagues while maintaining an appropriate tone. By combining speed, variation, and simple
              sharing controls, the tool supports high-quality communication at scale.
            </p>
          </div>
        </section>

        <AdBanner adSlot="TOOL_MID" adFormat="horizontal" className="mb-8" />

        <section className="mt-16 space-y-6">
          <div className="bg-glass rounded-2xl p-6 md:p-8 border border-gold/10">
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">Detailed Explanation: Creating Better Birthday Wishes in Less Time</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>Most people want to send a thoughtful birthday message, but writing one quickly is not always easy. This generator helps by offering ready-to-use lines that already include the recipient's name.</p>
              <p>What makes our birthday wishes different from generic messages? Every wish includes the recipient's name woven naturally into the message. This isn't just "Happy Birthday, [Name]" — the person's name is integrated throughout the wish in a way that feels genuine and thoughtful. When someone reads a message that mentions them by name multiple times, it creates a deeper emotional connection.</p>
              <p>The collection includes different tones, including romantic, warm, and celebratory formats, so users can pick a style that matches the relationship. Each generation returns five options, and refresh gives a new set for comparison.</p>
              <p>After selecting a message, users can copy it for any app or share it directly on WhatsApp. This keeps the flow simple when time is limited and a message needs to be sent quickly.</p>
            </div>
          </div>

          <div className="bg-glass rounded-2xl p-6 md:p-8 border border-gold/10">
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">How to Generate Birthday Wishes — Step by Step</h2>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span><span><strong className="text-foreground">Enter the birthday person's name</strong> — Type their name in the input field. Use the name they're most commonly called — "Priya" feels more personal than "Priya Sharma."</span></li>
              <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span><span><strong className="text-foreground">Click "Generate"</strong> — Hit the Generate button to create 5 unique birthday wishes personalized with their name.</span></li>
              <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">3</span><span><strong className="text-foreground">Browse your wishes</strong> — Scroll through the beautifully designed wish cards. Each has a different message style and emotional tone.</span></li>
              <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">4</span><span><strong className="text-foreground">Copy or Share</strong> — Found the perfect wish? Click "Copy" to paste it in any app, or click "WhatsApp" to share it directly.</span></li>
              <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">5</span><span><strong className="text-foreground">Refresh for more</strong> — Not satisfied? Click the Refresh button to generate 5 completely new wishes. Keep refreshing until you find the perfect one!</span></li>
            </ol>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">Birthday Wishes FAQ</h2>
            <FaqAccordion items={[
              { question: "Are wishes different every time I click Generate?", answer: "Yes. The generator refreshes and gives a new set of five wishes each time." },
              { question: "Can I use these wishes outside WhatsApp?", answer: "Yes. You can copy any message and use it in SMS, Instagram, email, or other apps." },
              { question: "Are wishes suitable for different age groups?", answer: "Yes. The tone is positive and works for friends, family, and colleagues." },
              { question: "Can I personalize wishes with a name?", answer: "Yes. Enter one name and all generated wishes are personalized accordingly." },
              { question: "How can I avoid generic-sounding birthday wishes?", answer: "Choose one generated wish and add a short personal memory or inside joke before sharing." },
            ]} />
          </div>
        </section>

        <RelatedToolsSection currentToolPath="/tools/birthday-wishes-generator" />
      </main>
      <Footer />
    </div>
  );
};

export default BirthdayWishesGenerator;
