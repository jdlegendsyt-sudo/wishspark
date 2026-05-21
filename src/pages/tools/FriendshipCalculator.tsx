import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Share2, Copy } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import SeoBreadcrumbs from "@/components/SeoBreadcrumbs";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdBanner from "@/components/AdBanner";
import JsonLd from "@/components/JsonLd";
import FaqAccordion from "@/components/FaqAccordion";
import RelatedToolsSection from "@/components/RelatedToolsSection";
import { toast } from "@/hooks/use-toast";
import { smoothScrollToElement } from "@/lib/scrollToElement";

const calcFriendship = (a: string, b: string) => {
  const s = (a + "bff" + b).toLowerCase().replace(/\s/g, "");
  let h = 7919;
  for (let i = 0; i < s.length; i++) h = ((h << 3) + h) ^ s.charCodeAt(i);
  return Math.abs(h % 41) + 60; // 60-100
};

const getLevel = (pct: number) => {
  if (pct >= 95) return { title: "BEST FRIENDS FOREVER! 👯", msg: "You two are inseparable! Your friendship is legendary and one for the ages.", emoji: "🏆" };
  if (pct >= 85) return { title: "Ride or Die! 🤝", msg: "You've got each other's back no matter what. This is friendship goals!", emoji: "⭐" };
  if (pct >= 75) return { title: "Great Friends! 🎉", msg: "Strong bond, real trust, and loads of fun together. Your friendship is awesome!", emoji: "🎊" };
  if (pct >= 65) return { title: "Good Buddies! 😊", msg: "A solid friendship with plenty of good times ahead. Keep building those memories!", emoji: "🌟" };
  return { title: "Growing Friendship! 🌱", msg: "Every amazing friendship starts somewhere. Spend more time together and watch it bloom!", emoji: "🌸" };
};

const FriendshipCalculator = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [result, setResult] = useState<{ pct: number; title: string; msg: string; emoji: string } | null>(null);
  const [isSharedView, setIsSharedView] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const calculate = () => {
    if (!name1.trim() || !name2.trim()) return;
    const pct = calcFriendship(name1, name2);
    setResult({ pct, ...getLevel(pct) });
    setIsSharedView(false);
    setTimeout(() => smoothScrollToElement(resultsRef.current), 120);
  };

  const getShareLink = () => {
    if (!result) return "";
    const url = new URL(`${window.location.origin}/tools/friendship-calculator`);
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

  const share = () => {
    if (!result) return;
    const text = `👯 Friendship Calculator!\n${name1} 🤝 ${name2} = ${result.pct}%\n${result.title}\n\nView this result: ${getShareLink()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const createYourOwn = () => {
    setSearchParams({});
    setName1("");
    setName2("");
    setResult(null);
    setIsSharedView(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const shared = searchParams.get("shared") === "1";
    const n1 = searchParams.get("n1") || "";
    const n2 = searchParams.get("n2") || "";
    if (!shared || !n1 || !n2) {
      return;
    }

    const pct = calcFriendship(n1, n2);
    setName1(n1);
    setName2(n2);
    setResult({ pct, ...getLevel(pct) });
    setIsSharedView(true);
    setTimeout(() => smoothScrollToElement(resultsRef.current), 120);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebApplication", "name": "Friendship Calculator — Friendship Percentage Test", "url": "https://www.wishspark.xyz/tools/friendship-calculator", "description": "Free friendship calculator online. Test your friendship percentage and compatibility by name. Best friendship meter to check how strong your friendship is!", "applicationCategory": "EntertainmentApplication", "operatingSystem": "All", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }, "publisher": { "@type": "Organization", "name": "WishSpark" } }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "How to test friendship compatibility?", "acceptedAnswer": { "@type": "Answer", "text": "Enter your name and your friend's name in our friendship calculator. It generates a friendship percentage score with a fun compatibility message about your bond!" }}, { "@type": "Question", "name": "What is a friendship percentage calculator?", "acceptedAnswer": { "@type": "Answer", "text": "A friendship percentage calculator is a fun tool that measures the compatibility between two friends based on their names. It gives a score from 60-100% with a friendship level title." }}, { "@type": "Question", "name": "Can I share my friendship score?", "acceptedAnswer": { "@type": "Answer", "text": "Yes! Share your friendship calculator result via WhatsApp with the Share button. It's perfect for Friendship Day celebrations and group chats!" }}] }} />
      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <SeoBreadcrumbs
          items={[
            { label: "Tools", href: "/#fun-tools" },
            { label: "Friendship Calculator" },
          ]}
        />
        <div className="text-center mb-8">
          <motion.div className="text-6xl mb-4" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>👯</motion.div>
          <h1 className="text-4xl font-display font-bold text-gold-gradient mb-3">Friendship Calculator — Friendship Percentage Test</h1>
          <p className="text-muted-foreground">Free friendship compatibility test by name — find your friendship percentage online!</p>
        </div>

        <div className="bg-glass rounded-2xl p-6 border border-gold/20 shadow-gold mb-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">👤 Your Name</label>
            <Input value={name1} onChange={(e) => setName1(e.target.value)} placeholder="Your name" maxLength={30} className="bg-secondary/50 border-gold/20" />
          </div>
          <div className="text-center text-2xl">🤝</div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">👤 Friend's Name</label>
            <Input value={name2} onChange={(e) => setName2(e.target.value)} placeholder="Friend's name" maxLength={30} className="bg-secondary/50 border-gold/20" />
          </div>
          <Button onClick={calculate} className="w-full bg-gold-gradient text-primary-foreground hover:opacity-90" size="lg">
            <Users className="w-4 h-4 mr-2" /> Calculate Friendship
          </Button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div ref={resultsRef} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-glass rounded-2xl p-8 border border-gold/20 shadow-gold text-center space-y-4 max-w-2xl mx-auto mb-8 md:mb-10">
              <p className="text-muted-foreground">{name1} 🤝 {name2}</p>
              <motion.p className="text-7xl font-bold text-primary"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                {result.pct}%
              </motion.p>
              <p className="text-4xl">{result.emoji}</p>
              <p className="text-xl font-display font-bold text-foreground">{result.title}</p>
              <p className="text-foreground max-w-md mx-auto">{result.msg}</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button onClick={copyShareLink} variant="outline" size="sm" className="border-gold/30 hover:bg-gold/10 hover:border-gold/50 transition-all">
                  <Copy className="w-3 h-3 mr-1" /> Copy
                </Button>
                <Button onClick={share} size="sm" className="bg-gold-gradient text-primary-foreground hover:opacity-90">
                  <Share2 className="w-3 h-3 mr-1" /> WhatsApp
                </Button>
                {isSharedView && (
                  <Button onClick={createYourOwn} className="bg-gold-gradient text-primary-foreground hover:opacity-90">
                    Create Your Own
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="mb-8 bg-glass rounded-2xl p-6 border border-gold/10">
          <h2 className="text-lg font-display font-semibold text-foreground mb-3">Introduction</h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Friendship is already fun, and this calculator adds a playful way to celebrate it. You can test a name pair, compare scores,
              and instantly share the result with friends for laughs and conversation.
            </p>
            <p>
              The output is intentionally positive: a percentage, a friendship level, and a short message that is easy to understand.
              Results are consistent for the same pair, so groups can recheck and compare without confusion.
            </p>
            <p>
              It works especially well for Friendship Day, classroom activities, group chats, and social challenges where people want a
              quick, shareable interaction that feels light and inclusive.
            </p>
          </div>
        </section>

        <section className="mb-8 bg-glass rounded-2xl p-6 border border-gold/10">
          <h2 className="text-lg font-display font-semibold text-foreground mb-3">The Science of Friendship and Why It Matters</h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Friendship is one of the strongest predictors of long-term happiness and health. A landmark Harvard study that followed
              participants for over 80 years found that close relationships — more than money, fame, or career success — were the best
              predictors of physical health and life satisfaction. Strong friendships reduce stress hormones, boost immune function, and
              even extend lifespan.
            </p>
            <p>
              Psychologist Robin Dunbar's research suggests that most people maintain about five close friendships at any given time, with
              an outer circle of roughly 15 good friends. These inner-circle relationships require regular interaction and shared experiences
              to stay strong. A friendship calculator, while playful, creates exactly that kind of shared moment — a tiny interaction that
              reinforces the bond.
            </p>
            <p>
              What makes friendships work long-term? Research consistently points to three factors: reciprocity (mutual effort), vulnerability
              (willingness to share feelings), and shared positive experiences. Using a fun tool together and laughing at the results checks
              the "shared positive experience" box in a small but meaningful way.
            </p>
          </div>
        </section>

        <section className="mb-8 bg-glass rounded-2xl p-6 border border-gold/10">
          <h2 className="text-lg font-display font-semibold text-foreground mb-3">Best Occasions to Use the Friendship Calculator</h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Friendship Day celebrations:</strong> International Friendship Day (first Sunday of August)
              is the most popular time for friendship calculators. Groups create leaderboards of friendship scores and share the results
              on WhatsApp Status and Instagram Stories. Some schools and colleges organize friendship calculator challenges as part of
              their Friendship Week activities.
            </p>
            <p>
              <strong className="text-foreground">Classroom and campus bonding:</strong> Teachers and student clubs use friendship calculators
              during orientation weeks, cultural festivals, and team-building sessions. The tool helps break ice between new students
              who might not know each other well yet.
            </p>
            <p>
              <strong className="text-foreground">Group chat games:</strong> WhatsApp and Telegram groups use friendship calculators as
              quick activities during boring evenings. Each person tests their name with every other member and the group creates a
              fun ranking. The built-in WhatsApp sharing makes this seamless.
            </p>
            <p>
              <strong className="text-foreground">Birthday and farewell messages:</strong> Friends include their friendship calculator
              score in birthday messages or farewell cards as a fun personal touch. A screenshot of a high friendship percentage adds
              a playful element to heartfelt messages.
            </p>
          </div>
        </section>

        <AdBanner adSlot="TOOL_MID" adFormat="horizontal" className="mb-8" />

        <section className="mt-16 space-y-6">
          <div className="bg-glass rounded-2xl p-6 md:p-8 border border-gold/10">
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">Detailed Explanation: Measuring and Sharing Friendship Scores</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>Friendships are a major part of daily life, but most people do not get many occasions to celebrate them. This calculator gives friends a quick, playful way to run a name pair, view a score, and share a light result in chat.</p>
              <p>The score range is 60% to 100%, and each range maps to a simple friendship label. The labels are meant to keep the output friendly and easy to interpret, especially when multiple friends are comparing results.</p>
              <p>The tool works best in social use cases: group chats, campus activities, Friendship Day campaigns, or just casual evening fun. Because each run is quick, users can test several combinations without leaving the page.</p>
              <p>Sharing is optional, but when people do share results, it often leads to playful back-and-forth and more interaction inside the group.</p>
            </div>
          </div>

          <div className="bg-glass rounded-2xl p-6 md:p-8 border border-gold/10">
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">How to Use the Friendship Calculator</h2>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span><span><strong className="text-foreground">Enter your name</strong> — Type your first name in the "Your Name" field. Keep it simple — first names work best.</span></li>
              <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span><span><strong className="text-foreground">Enter your friend's name</strong> — Type the name of the friend you want to test your compatibility with.</span></li>
              <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">3</span><span><strong className="text-foreground">Click "Calculate Friendship"</strong> — Your friendship percentage appears with a spring animation, along with a friendship level title and a personalized message about your bond.</span></li>
              <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">4</span><span><strong className="text-foreground">Share with your friend</strong> — Click "Share with Friends" to send your friendship score via WhatsApp. Watch your friend's reaction!</span></li>
            </ol>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">Friendship Calculator FAQ</h2>
            <FaqAccordion items={[
              { question: "Why does the friendship score start from 60%?", answer: "The tool uses a positive baseline intentionally. Since friendship is inherently positive, starting from 60% ensures every result feels encouraging and celebratory. Even the lowest possible score comes with a 'Growing Friendship' message that focuses on potential rather than negativity. The design philosophy is that no friendship test should make someone feel bad." },
              { question: "Can I test with multiple friends at once?", answer: "You can run unlimited name pairs one at a time. Many groups take turns testing every pair combination and create a fun leaderboard. For a group of 5 friends, that means 10 unique pairs to test — which turns into a fun 10-minute activity with plenty of laughs and comparisons." },
              { question: "Is this a scientific compatibility test?", answer: "No. The friendship calculator is designed entirely for entertainment and social interaction. It uses a name-based algorithm to generate a fun percentage, not any validated psychological assessment. Real friendship compatibility depends on shared values, communication styles, trust, and mutual effort — things no algorithm can measure from names alone." },
              { question: "Can I share the friendship score on WhatsApp?", answer: "Yes. Click the WhatsApp button to send your friendship score directly to your friend or a group chat. The shared message includes both names, the percentage score, the friendship level title, and a link where anyone can try their own combination. The share format is clean and ready to post." },
              { question: "How can groups use this tool during Friendship Day?", answer: "The most popular approach is creating a group leaderboard. Each person tests their name with every other group member, and you track who has the highest average friendship score. Some groups screenshot every result and create a collage or Stories compilation. Schools and colleges also use it during Friendship Week as an icebreaker activity." },
              { question: "Does the name order matter for friendship scores?", answer: "Yes, entering names in a different order may produce a slightly different percentage. This is because the algorithm processes the combined string in sequence. Many friends try both orders and pick their favorite score for sharing." },
            ]} />
          </div>
        </section>

        <RelatedToolsSection currentToolPath="/tools/friendship-calculator" />
      </main>
      <Footer />
    </div>
  );
};

export default FriendshipCalculator;
