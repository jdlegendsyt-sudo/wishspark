import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Copy, Share2, RefreshCw } from "lucide-react";
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

const generateNames = (a: string, b: string): string[] => {
  const results = new Set<string>();
  const al = a.trim(), bl = b.trim();
  if (!al || !bl) return [];

  // Method 1: First half + second half
  for (let i = 1; i <= Math.ceil(al.length / 2) + 1 && i < al.length; i++) {
    for (let j = Math.floor(bl.length / 2) - 1; j >= 0 && j < bl.length; j++) {
      const name = al.slice(0, i) + bl.slice(j);
      if (name.length >= 3 && name.length <= 12) results.add(name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
    }
  }
  // Method 2: Reverse
  for (let i = 1; i <= Math.ceil(bl.length / 2) + 1 && i < bl.length; i++) {
    for (let j = Math.floor(al.length / 2) - 1; j >= 0 && j < al.length; j++) {
      const name = bl.slice(0, i) + al.slice(j);
      if (name.length >= 3 && name.length <= 12) results.add(name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
    }
  }
  // Method 3: Initials + name
  results.add(al.charAt(0).toUpperCase() + bl.toLowerCase());
  results.add(bl.charAt(0).toUpperCase() + al.toLowerCase());
  // Hashtag style
  results.add(al.charAt(0).toUpperCase() + al.slice(1).toLowerCase() + bl.charAt(0).toUpperCase() + bl.slice(1).toLowerCase());

  return Array.from(results).slice(0, 8);
};

const CoupleNameGenerator = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [names, setNames] = useState<string[]>([]);
  const [isSharedView, setIsSharedView] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const generate = () => {
    const result = generateNames(name1, name2);
    setNames(result);
    setIsSharedView(false);
    setTimeout(() => smoothScrollToElement(resultsRef.current), 120);
  };

  const getShareLink = () => {
    if (names.length === 0) return "";
    const url = new URL(`${window.location.origin}/tools/couple-name-generator`);
    url.searchParams.set("shared", "1");
    url.searchParams.set("n1", name1.trim());
    url.searchParams.set("n2", name2.trim());
    return url.toString();
  };

  const copyShareLink = async () => {
    const link = getShareLink();
    if (!link) return;
    await navigator.clipboard.writeText(link);
    toast({ title: "Link copied", description: "Share link is ready to send" });
  };

  const createYourOwn = () => {
    setSearchParams({});
    setName1("");
    setName2("");
    setNames([]);
    setIsSharedView(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copy = (n: string) => {
    navigator.clipboard.writeText(n);
    toast({ title: "Copied!", description: `"${n}" copied to clipboard` });
  };

  useEffect(() => {
    const shared = searchParams.get("shared") === "1";
    const n1 = searchParams.get("n1") || "";
    const n2 = searchParams.get("n2") || "";
    if (!shared || !n1 || !n2) {
      return;
    }

    setName1(n1);
    setName2(n2);
    setNames(generateNames(n1, n2));
    setIsSharedView(true);
    setTimeout(() => smoothScrollToElement(resultsRef.current), 120);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebApplication", "name": "Couple Name Generator — Ship Name Creator", "url": "https://www.wishspark.xyz/tools/couple-name-generator", "description": "Free couple name generator online. Create the perfect ship name by combining two names. Best couple name combiner for Instagram bios & hashtags!", "applicationCategory": "EntertainmentApplication", "operatingSystem": "All", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }, "publisher": { "@type": "Organization", "name": "WishSpark" } }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "What is a couple name or ship name?", "acceptedAnswer": { "@type": "Answer", "text": "A couple name (or ship name) is a fun combination of two partners' names into one unique name. For example, Brad + Angelina = Brangelina. Our generator creates multiple creative combinations!" }}, { "@type": "Question", "name": "How does the couple name generator work?", "acceptedAnswer": { "@type": "Answer", "text": "Enter both partners' names and our algorithm generates up to 8 creative couple name combinations by blending syllables, initials, and name parts in different ways." }}, { "@type": "Question", "name": "Can I use the couple name for Instagram?", "acceptedAnswer": { "@type": "Answer", "text": "Absolutely! Each generated couple name comes with a # hashtag format, perfect for Instagram bios, captions, and social media profiles. Copy with one click!" }}] }} />
      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <SeoBreadcrumbs
          items={[
            { label: "Tools", href: "/#fun-tools" },
            { label: "Couple Name Generator" },
          ]}
        />
        <div className="text-center mb-8">
          <motion.div className="text-6xl mb-4" animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2 }}>💑</motion.div>
          <h1 className="text-4xl font-display font-bold text-gold-gradient mb-3">Couple Name Generator — Ship Name Creator</h1>
          <p className="text-muted-foreground">Free couple name combiner online — create the perfect ship name for you and your partner!</p>
        </div>

        <div className="bg-glass rounded-2xl p-6 border border-gold/20 shadow-gold mb-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">First Person's Name</label>
            <Input value={name1} onChange={(e) => setName1(e.target.value)} placeholder="e.g. Arun" maxLength={20} className="bg-secondary/50 border-gold/20" />
          </div>
          <div className="text-center text-2xl">💕</div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Second Person's Name</label>
            <Input value={name2} onChange={(e) => setName2(e.target.value)} placeholder="e.g. Priya" maxLength={20} className="bg-secondary/50 border-gold/20" />
          </div>
          <Button onClick={generate} className="w-full bg-gold-gradient text-primary-foreground hover:opacity-90" size="lg">
            <Heart className="w-4 h-4 mr-2" /> Generate Couple Names
          </Button>
        </div>

        {names.length > 0 && (
          <motion.div ref={resultsRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-2xl mx-auto mb-8 md:mb-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-semibold text-foreground">Your Couple Names 💕</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={generate}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
                <Button variant="outline" size="sm" onClick={copyShareLink} className="border-gold/30 hover:bg-gold/10 hover:border-gold/50 transition-all"><Copy className="w-4 h-4 mr-1" /> Copy</Button>
                {isSharedView && (
                  <Button size="sm" onClick={createYourOwn} className="bg-gold-gradient text-primary-foreground hover:opacity-90">Create Your Own</Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {names.map((name, i) => (
                <motion.div key={name} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                  className="bg-glass rounded-xl p-4 border border-gold/10 text-center group">
                  <p className="text-lg font-display font-bold text-primary mb-2">#{name}</p>
                  <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => copy(name)}><Copy className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      const text = `💕 Our couple name is #${name}!\n\nView all generated names: ${getShareLink()}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                    }}><Share2 className="w-3 h-3" /></Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <section className="mb-8 bg-glass rounded-2xl p-6 border border-gold/10">
          <h2 className="text-lg font-display font-semibold text-foreground mb-3">Introduction</h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Couple names are fun, but making one manually can be surprisingly difficult. Most combinations sound awkward on the first try.
              This tool solves that by generating multiple options instantly, so you can pick something that actually feels natural.
            </p>
            <p>
              Instead of forcing one output, the generator gives a shortlist based on different blending patterns. That helps when you want
              different styles, such as cute, clean, classy, or hashtag-friendly names.
            </p>
            <p>
              Every result is shown in hashtag-ready format, so you can use it directly in bios, reels, wedding posts, or couple pages.
              The goal is simple: less trial-and-error, faster decisions, and names that are easy to remember and type.
            </p>
          </div>
        </section>

        <AdBanner adSlot="TOOL_MID" adFormat="horizontal" className="mb-8" />

        <section className="mt-16 space-y-6">
          <div className="bg-glass rounded-2xl p-6 md:p-8 border border-gold/10">
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">Detailed Explanation: How Name Blending Produces Better Couple Tags</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>Blended couple names, often called ship names, are commonly used for usernames, event hashtags, and private nicknames. The idea is simple, but manually combining names can be inconsistent and time-consuming.</p>
              <p>This generator creates up to eight options using different blending patterns, so users can compare readability, style, and pronunciation before choosing one. Having multiple options helps avoid awkward combinations.</p>
              <p>Results are shown in hashtag-ready format because many users apply them directly to social profiles, wedding content, or shared posts. This makes the output practical beyond just trying one random name.</p>
              <p>If you are deciding between options with someone else, the copy and share actions make comparison easier without repeating the generation process.</p>
            </div>
          </div>

          <div className="bg-glass rounded-2xl p-6 md:p-8 border border-gold/10">
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">How to Generate Couple Names</h2>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span><span><strong className="text-foreground">Enter the first person's name</strong> — Type the first name in the field. This could be you or your partner — the order affects the combinations generated.</span></li>
              <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span><span><strong className="text-foreground">Enter the second person's name</strong> — Type the other person's name. Together, these two names become the ingredients for your ship name.</span></li>
              <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">3</span><span><strong className="text-foreground">Click "Generate Couple Names"</strong> — Watch as up to 8 creative couple name combinations appear in a beautiful grid layout.</span></li>
              <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">4</span><span><strong className="text-foreground">Pick your favorite</strong> — Hover over any name to reveal Copy and Share options. Copy it to your clipboard or share via WhatsApp.</span></li>
              <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">5</span><span><strong className="text-foreground">Try swapping names</strong> — Different name orders produce different combinations. Swap the names around to discover even more options!</span></li>
            </ol>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">Couple Name Generator FAQ</h2>
            <FaqAccordion items={[
              { question: "What is a couple name or ship name?", answer: "Both terms refer to the same idea: a blended name representing two people." },
              { question: "Can I use generated names as wedding hashtags?", answer: "Yes. Many outputs are hashtag-friendly and suitable for wedding posts and invites." },
              { question: "Does name order change results?", answer: "Yes. Swapping name order can produce different combinations." },
              { question: "How many names are generated in one run?", answer: "Up to eight options are generated so you can choose the best fit." },
              { question: "How do I pick the best couple name from the list?", answer: "Pick the option that is easy to pronounce, memorable, and natural as a hashtag." },
            ]} />
          </div>
        </section>

        <RelatedToolsSection currentToolPath="/tools/couple-name-generator" />
      </main>
      <Footer />
    </div>
  );
};

export default CoupleNameGenerator;
