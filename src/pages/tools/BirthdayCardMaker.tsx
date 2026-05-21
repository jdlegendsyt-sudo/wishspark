import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import SeoBreadcrumbs from "@/components/SeoBreadcrumbs";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AdBanner from "@/components/AdBanner";
import JsonLd from "@/components/JsonLd";
import FaqAccordion from "@/components/FaqAccordion";
import RelatedToolsSection from "@/components/RelatedToolsSection";

const themes = [
  { name: "Classic Gold", bg: "from-amber-600 via-yellow-500 to-orange-500", emoji: "🎂", text: "text-white" },
  { name: "Royal Purple", bg: "from-purple-600 via-violet-500 to-pink-500", emoji: "🎈", text: "text-white" },
  { name: "Ocean Blue", bg: "from-blue-600 via-cyan-500 to-teal-400", emoji: "🎁", text: "text-white" },
  { name: "Rose Garden", bg: "from-pink-500 via-rose-400 to-red-400", emoji: "🌹", text: "text-white" },
  { name: "Forest Green", bg: "from-emerald-600 via-green-500 to-lime-400", emoji: "🌟", text: "text-white" },
  { name: "Sunset Glow", bg: "from-orange-500 via-red-400 to-pink-500", emoji: "✨", text: "text-white" },
];

const BirthdayCardMaker = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("Wishing you a day filled with love, laughter, and all your favorite things!");
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [isSharedView, setIsSharedView] = useState(false);

  const theme = themes[selectedTheme];

  const getShareLink = () => {
    const url = new URL(`${window.location.origin}/tools/birthday-card-maker`);
    url.searchParams.set("shared", "1");
    url.searchParams.set("name", name.trim());
    url.searchParams.set("msg", message);
    url.searchParams.set("theme", String(selectedTheme));
    return url.toString();
  };

  const shareCard = () => {
    const text = `🎂 Happy Birthday, ${name || "Friend"}!\n\n${message}\n\nView this card: ${getShareLink()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const createYourOwn = () => {
    setSearchParams({});
    setName("");
    setMessage("Wishing you a day filled with love, laughter, and all your favorite things!");
    setSelectedTheme(0);
    setIsSharedView(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const shared = searchParams.get("shared") === "1";
    if (!shared) {
      return;
    }

    const sharedName = searchParams.get("name") || "";
    const sharedMsg = searchParams.get("msg") || "Wishing you a day filled with love, laughter, and all your favorite things!";
    const themeParam = Number(searchParams.get("theme") || "0");
    const safeTheme = Number.isFinite(themeParam) ? Math.min(Math.max(themeParam, 0), themes.length - 1) : 0;

    setName(sharedName);
    setMessage(sharedMsg);
    setSelectedTheme(safeTheme);
    setIsSharedView(true);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebApplication", "name": "Birthday Card Maker Online Free", "url": "https://www.wishspark.xyz/tools/birthday-card-maker", "description": "Free birthday card maker online. Create beautiful birthday greeting cards with name and custom message. No signup required!", "applicationCategory": "DesignApplication", "operatingSystem": "All", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }, "publisher": { "@type": "Organization", "name": "WishSpark" } }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "How to make a birthday card online free?", "acceptedAnswer": { "@type": "Answer", "text": "Use our free birthday card maker! Enter the person's name, write a custom message, choose a beautiful theme, and your card is ready to share via WhatsApp — no signup needed!" }}, { "@type": "Question", "name": "Can I customize my birthday card?", "acceptedAnswer": { "@type": "Answer", "text": "Yes! You can add the recipient's name, write a personal message, and choose from 6 beautiful color themes including Gold, Purple, Blue, Rose, Green, and Sunset." }}, { "@type": "Question", "name": "Is the birthday card maker free to use?", "acceptedAnswer": { "@type": "Answer", "text": "100% free! No signup, no downloads, no watermarks. Create unlimited birthday cards and share them instantly via WhatsApp." }}] }} />
      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <SeoBreadcrumbs
          items={[
            { label: "Tools", href: "/#fun-tools" },
            { label: "Birthday Card Maker" },
          ]}
        />
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-gold-gradient mb-3">Birthday Card Maker Online Free</h1>
          <p className="text-muted-foreground">Design beautiful birthday greeting cards online free — create birthday wishes card with name, no signup required!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-4">
            <div className="bg-glass rounded-2xl p-6 border border-gold/20 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Birthday person's name" maxLength={30} className="bg-secondary/50 border-gold/20" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Message</label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={200} className="bg-secondary/50 border-gold/20" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {themes.map((t, i) => (
                    <button key={i} onClick={() => setSelectedTheme(i)}
                      className={`rounded-lg p-2 text-xs font-medium border-2 transition-all bg-gradient-to-br ${t.bg} ${t.text} ${selectedTheme === i ? "border-foreground scale-105" : "border-transparent opacity-70"}`}>
                      {t.emoji} {t.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={shareCard} className="flex-1 bg-gold-gradient text-primary-foreground hover:opacity-90">
                  <Share2 className="w-4 h-4 mr-2" /> Share via WhatsApp
                </Button>
                {isSharedView && (
                  <Button onClick={createYourOwn} className="bg-gold-gradient text-primary-foreground hover:opacity-90">
                    Create Your Own
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl p-8 bg-gradient-to-br ${theme.bg} ${theme.text} shadow-2xl aspect-[4/5] flex flex-col items-center justify-center text-center relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10 space-y-4">
                <motion.div className="text-6xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                  {theme.emoji}
                </motion.div>
                <p className="text-lg font-medium opacity-90">Happy Birthday</p>
                <h2 className="text-3xl font-display font-bold">{name || "Your Name"}</h2>
                <div className="w-16 h-0.5 bg-white/50 mx-auto" />
                <p className="text-sm opacity-90 leading-relaxed max-w-xs">{message}</p>
                <p className="text-xs opacity-60 mt-4">🎉 Wishing you love & joy! 🎉</p>
              </div>
            </motion.div>
          </div>
        </div>

        <section className="mb-8 mt-8 bg-glass rounded-2xl p-6 border border-gold/10">
          <h2 className="text-lg font-display font-semibold text-foreground mb-3">Introduction</h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              A good birthday card does more than deliver a greeting. It shows intention, memory, and care in a format that people can
              keep, revisit, and share. The problem is that many online card tools are either too limited, too complex, or locked behind
              sign-up walls. This page is designed for users who want a professional result quickly without downloading design software or
              spending time on advanced editing.
            </p>
            <p>
              With this tool, you can personalize name, message, and visual theme in a single workflow. The live preview helps you validate
              tone and readability before sharing, which reduces mistakes and improves message quality. Whether you are sending a personal
              card to a close friend or preparing multiple greetings for a team, the workflow stays fast and consistent.
            </p>
            <p>
              The page is also optimized for repeat use. You can quickly switch themes, revise text, and regenerate your final card without
              losing context. This supports both spontaneous personal use and planned communication during busy birthday seasons when many
              messages must be sent in a short time window.
            </p>
          </div>
        </section>

        <AdBanner adSlot="TOOL_BOTTOM" adFormat="horizontal" className="mt-8" />

        <section className="mt-16 space-y-6">
          <div className="bg-glass rounded-2xl p-6 md:p-8 border border-gold/10">
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">Detailed Explanation: Building Personalized Birthday Cards That Feel Thoughtful</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>Birthdays are personal milestones, but many greetings still feel rushed or generic. This card maker helps users create a cleaner, more personal message format with name, custom text, and theme in one place.</p>
              <p>Many card tools interrupt the flow with account steps or feature limits. This page keeps the process straightforward: open it, personalize the card, preview the result, and share when you're satisfied. That makes it practical for both quick one-off wishes and repeated use.</p>
              <p>The card maker offers six carefully designed color themes, each chosen to evoke different moods and emotions. The Classic Gold theme brings warmth and elegance. Royal Purple feels regal and sophisticated. Ocean Blue is calm and refreshing. Rose Garden is romantic and tender. Forest Green is fresh and vibrant. And Sunset Glow is energetic and joyful. Each theme transforms the entire card design, so you can match the personality of the birthday person.</p>
              <p>Your finished card includes the recipient's name prominently displayed, your custom message in beautiful typography, and a subtle animation that makes the card feel alive. It's the kind of birthday greeting that people actually remember receiving — not just another message lost in a flood of WhatsApp forwards.</p>
            </div>
          </div>

          <div className="bg-glass rounded-2xl p-6 md:p-8 border border-gold/10">
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">How to Create a Birthday Card — Step by Step</h2>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span><span><strong className="text-foreground">Enter the birthday person's name</strong> — Type their name in the Name field. This will appear as the main heading on the card. Keep it personal — use the name they go by, not their formal name.</span></li>
              <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span><span><strong className="text-foreground">Write a custom message</strong> — Replace the default message with something personal. Mention a shared memory, an inside joke, or simply express what they mean to you. Personal messages make all the difference.</span></li>
              <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">3</span><span><strong className="text-foreground">Choose a color theme</strong> — Click on any of the 6 themes to preview how your card looks. Pick the one that matches the birthday person's style or your relationship with them.</span></li>
              <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">4</span><span><strong className="text-foreground">Preview your card</strong> — The live preview on the right shows exactly how your card will look. Check the name, message, and theme before sharing.</span></li>
              <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">5</span><span><strong className="text-foreground">Share via WhatsApp</strong> — Click the "Share via WhatsApp" button to send your personalized birthday card directly to the recipient or a WhatsApp group.</span></li>
            </ol>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">Birthday Card FAQ</h2>
            <FaqAccordion items={[
              { question: "Can I download this birthday card as an image?", answer: "At the moment, this tool is focused on instant sharing. Image download can be added in a future update." },
              { question: "Is there a limit on the number of cards?", answer: "No. You can create unlimited cards for free." },
              { question: "Do I need to create an account?", answer: "No signup is required. Open the tool, customize, and share." },
              { question: "Can I edit text and theme before sharing?", answer: "Yes. You can adjust name, message, and theme as many times as needed." },
              { question: "Why use this over a plain text wish?", answer: "A personalized card format feels more thoughtful and memorable than a generic one-line message." },
            ]} />
          </div>
        </section>

        <RelatedToolsSection currentToolPath="/tools/birthday-card-maker" />
      </main>
      <Footer />
    </div>
  );
};

export default BirthdayCardMaker;
