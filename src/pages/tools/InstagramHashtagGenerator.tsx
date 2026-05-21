import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Hash, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
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

const normalizeKeyword = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ");

const generateHashtags = (keyword: string) => {
  const clean = normalizeKeyword(keyword);
  if (!clean) return [];

  const compact = clean.replace(/\s+/g, "");
  const title = clean.split(" ").filter(Boolean);
  const capitalized = title.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");

  const starters = [
    compact,
    `${compact}tips`,
    `${compact}ideas`,
    `${compact}content`,
    `${compact}strategy`,
    `${compact}creator`,
    `${compact}community`,
    `${compact}daily`,
    `${compact}guide`,
    `${compact}brand`,
  ];

  const broader = [
    "instagramgrowth",
    "contentmarketing",
    "socialmediatips",
    "reelsstrategy",
    "organicgrowth",
    "digitalbranding",
    "contentcreator",
    "audiencegrowth",
    "engagementtips",
    "smallbusinessmarketing",
    "creatoreconomy",
    "socialmedia2026",
  ];

  const variations = [
    `${compact}forinstagram`,
    `${compact}business`,
    `${compact}reels`,
    `${compact}posts`,
    `${compact}inspiration`,
    `${compact}marketing`,
    `${compact}expert`,
    `${compact}niche`,
    `${compact}discover`,
    `${capitalized}`,
  ];

  const all = [...starters, ...variations, ...broader]
    .map((tag) => `#${tag.replace(/[^a-zA-Z0-9]/g, "")}`)
    .filter((tag) => tag.length > 2);

  return Array.from(new Set(all)).slice(0, 28);
};

const InstagramHashtagGenerator = () => {
  const [keyword, setKeyword] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);

  const handleGenerate = () => {
    const generated = generateHashtags(keyword);
    if (generated.length === 0) {
      toast({ title: "Enter a niche or topic", description: "Use a keyword like fitness coach, handmade candles, cafe, or travel reels.", variant: "destructive" });
      return;
    }
    setHashtags(generated);
    toast({ title: "Hashtags generated", description: `Created ${generated.length} hashtag ideas for your topic.` });
  };

  const handleCopy = async () => {
    if (hashtags.length === 0) return;
    await navigator.clipboard.writeText(hashtags.join(" "));
    toast({ title: "Copied", description: "All generated hashtags have been copied." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebApplication", name: "Instagram Hashtag Generator", url: "https://www.wishspark.xyz/tools/instagram-hashtag-generator", description: "Generate Instagram hashtags for growth, reach, and niche discovery. Create relevant hashtag sets for reels, posts, creators, and small businesses.", applicationCategory: "BusinessApplication", operatingSystem: "All", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, publisher: { "@type": "Organization", name: "WishSpark" } }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [
        { "@type": "Question", name: "How does the Instagram hashtag generator work?", acceptedAnswer: { "@type": "Answer", text: "Enter a niche keyword such as fashion boutique, travel creator, or fitness coach, and the tool generates a balanced set of relevant Instagram hashtags." } },
        { "@type": "Question", name: "How many hashtags should I use on Instagram?", acceptedAnswer: { "@type": "Answer", text: "Many creators test smaller focused sets rather than stuffing every post. This tool gives you a usable range you can refine based on performance." } },
        { "@type": "Question", name: "Can this help with Instagram growth?", acceptedAnswer: { "@type": "Answer", text: "It can help you start with relevant tags, but growth still depends on content quality, audience fit, consistency, and strong post hooks." } },
        { "@type": "Question", name: "Should I use the same hashtags on every post?", acceptedAnswer: { "@type": "Answer", text: "No. Rotating and refining hashtag sets based on topic and post format is usually more effective than repeating one identical block." } },
        { "@type": "Question", name: "Is this useful for reels and business accounts?", acceptedAnswer: { "@type": "Answer", text: "Yes. It can be used for reels, static posts, creator pages, local businesses, and niche content planning." } }
      ] }} />

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <SeoBreadcrumbs
          items={[
            { label: "Tools", href: "/#fun-tools" },
            { label: "Instagram Hashtag Generator" },
          ]}
        />
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <motion.div className="text-6xl mb-4" animate={{ rotate: [0, -6, 6, 0] }} transition={{ repeat: Infinity, duration: 2.4 }}>#️⃣</motion.div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gold-gradient mb-4">Instagram Hashtag Generator</h1>
          <p className="text-muted-foreground text-base md:text-lg">Generate targeted Instagram hashtag ideas for creators, brands, niche pages, and small businesses that want better discoverability without guesswork.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.95fr] gap-6 mb-10">
          <section className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/20 shadow-gold">
            <div className="flex items-center gap-2 mb-4 text-foreground">
              <Hash className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-semibold">Generate a hashtag set</h2>
            </div>
            <label className="text-sm font-medium text-foreground block mb-2">Keyword or niche</label>
            <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Example: healthy meal prep, travel reels, home decor store" className="bg-secondary/50 border-gold/20" />
            <div className="flex flex-wrap gap-3 mt-4">
              <Button onClick={handleGenerate} className="bg-gold-gradient text-primary-foreground hover:opacity-90">
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Hashtags
              </Button>
              <Button variant="outline" onClick={handleCopy} className="border-gold/30 hover:bg-gold/10">
                <Copy className="w-4 h-4 mr-2" />
                Copy All
              </Button>
            </div>
          </section>

          <aside className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">Generated hashtags</h2>
            {hashtags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag) => (
                  <span key={tag} className="rounded-full border border-gold/20 bg-primary/5 px-3 py-1.5 text-sm text-foreground">{tag}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">Your hashtag set will appear here. Use a clear niche phrase so the results stay more relevant and useful.</p>
            )}
          </aside>
        </div>

        <section className="mb-10 bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
          <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Introduction</h2>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              An Instagram hashtag generator is useful because most creators and businesses do not struggle with posting. They struggle with positioning. A post can be visually strong and still fail to reach the right audience if the supporting metadata is weak or generic. Hashtags are not a guaranteed growth engine on their own, but they still play a role in content categorization, discovery signals, and audience alignment. Used thoughtfully, they can help a post connect with the right topic cluster rather than floating without context.
            </p>
            <p>
              The problem is that manual hashtag research is repetitive. People often copy a random set from another account, use overly broad tags, or repeat the same block on every post. That approach wastes space and rarely matches the actual content angle. This page is designed to make the starting point more practical. You enter a niche keyword, and the generator creates a cleaner set of hashtag ideas that combines topic-specific phrases with broader discovery terms relevant to Instagram content strategy.
            </p>
            <p>
              On WishSpark, tools are built to support real workflows rather than surface-level novelty. That means the hashtag generator is meant to help creators and marketers move faster while staying intentional. It can be used for reels planning, post captions, content batching, client drafts, business pages, and creator niche research. Instead of guessing from memory every time you write a caption, you can build a more relevant set in seconds and then refine it based on performance.
            </p>
          </div>
        </section>

        <AdBanner adSlot="TOOL_MID" adFormat="horizontal" className="mb-10" />

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <div className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Detailed Explanation: What Hashtags Can and Cannot Do for Instagram Growth</h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Hashtags work best when they support relevance, not when they are treated like magic shortcuts. Many creators overestimate what hashtags can do and underestimate the importance of topic clarity, strong hooks, and audience fit. If a reel has weak retention or a carousel does not communicate value quickly, no hashtag block can fully compensate for that. But when the content is already useful, well-positioned hashtags can help the post sit inside the right niche signals and reach people who actively browse or engage with similar topics.
                </p>
                <p>
                  The most common mistake is going too broad. Tags like #love, #instagood, or #viral are massive, generic, and often disconnected from the actual post. They rarely help smaller creators because the competition is extreme and the audience intent is weak. A more effective approach is to combine focused niche tags, supporting industry tags, and a smaller number of broad discovery terms. That balance gives Instagram better context about where your content belongs and who might care about it.
                </p>
                <p>
                  Another mistake is repetition. Using the exact same 30 hashtags on every post suggests that the creator is operating from habit rather than relevance. A food creator posting meal prep, restaurant reviews, and grocery tips should not use one identical hashtag block for all three. The core niche may overlap, but the content intent is different. Smart creators rotate and refine their tags so each post is paired with language that reflects the actual topic and audience angle.
                </p>
                <p>
                  This is where a generator becomes useful. It reduces the time spent brainstorming and gives you a structured starting set around a keyword or niche. That does not mean you should copy every result blindly. The best workflow is to generate, trim, and adapt. Keep the most relevant tags, remove anything that feels too broad or off-topic, and test variations over time. Tools should accelerate judgment, not replace it.
                </p>
                <p>
                  Hashtags also work differently depending on the type of account. A local bakery might benefit from niche food and location-based tags. A creator education page may need strategy-oriented terms that reflect topics like reels, audience growth, or digital branding. A fashion page may want a mix of style terms, outfit-intent tags, and seasonal discovery tags. That is why input quality matters. The clearer the keyword you enter, the more useful the generated set becomes.
                </p>
                <p>
                  In practice, the goal is not simply to generate more hashtags. It is to generate better ones faster. That helps creators maintain consistency, improve caption workflows, and reduce the guesswork that often slows down content publishing. Used correctly, a hashtag generator supports efficiency, relevance, and smarter testing, which is exactly the kind of value a practical tools page should provide.
                </p>
              </div>
            </div>

            <div className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">How to Use the Hashtag Generator</h2>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span><span>Type a niche keyword that describes the post topic or account focus, such as skincare routine, handmade candles, travel reels, or real estate tips.</span></li>
                <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span><span>Click <strong className="text-foreground">Generate Hashtags</strong> to create a balanced set of niche and broader discovery tags.</span></li>
                <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">3</span><span>Review the list and remove any tags that feel too broad, too repetitive, or not fully relevant to your actual caption and media.</span></li>
                <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">4</span><span>Copy the final set and use it inside your posting workflow, then compare post performance over time to refine future hashtag groups.</span></li>
              </ol>
            </div>

            <div className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Benefits of a Practical Hashtag Tool</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-gold/10 p-4 bg-primary/5"><p className="font-medium text-foreground mb-2">Faster caption workflow</p><p>Generate a usable starting set quickly instead of rebuilding hashtag ideas from memory every time.</p></div>
                <div className="rounded-2xl border border-gold/10 p-4 bg-primary/5"><p className="font-medium text-foreground mb-2">Better relevance</p><p>Start with topic-led tags instead of relying on random trending terms that may not fit the post.</p></div>
                <div className="rounded-2xl border border-gold/10 p-4 bg-primary/5"><p className="font-medium text-foreground mb-2">More consistent testing</p><p>Create and refine multiple sets across different content themes to learn what supports reach and saves time.</p></div>
                <div className="rounded-2xl border border-gold/10 p-4 bg-primary/5"><p className="font-medium text-foreground mb-2">Useful for creators and businesses</p><p>The same workflow can support influencer pages, niche creators, e-commerce shops, local businesses, and client publishing teams.</p></div>
              </div>
            </div>

            <div className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10 text-sm text-muted-foreground leading-relaxed">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-3">Read the complete guide</h2>
              <p className="mb-4">If you want a deeper look at hashtag strategy, niche selection, rotation tips, and common mistakes, start with the full blog guide.</p>
              <Link to="/blog/best-instagram-hashtags-for-growth-in-2026" className="text-primary hover:underline font-medium">Best Instagram Hashtags for Growth in 2026</Link>
            </div>

            <div>
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
              <FaqAccordion items={[
                { question: "Will hashtags alone make my Instagram grow?", answer: "No. They help with relevance and discovery, but content quality, retention, post structure, and audience fit matter far more." },
                { question: "How many hashtags should I use from the generated list?", answer: "Use the list as a starting point. Many creators trim it to a more focused set depending on the post and testing strategy." },
                { question: "Can I use this for reels and normal posts?", answer: "Yes. It works for reels, single-image posts, carousels, creator pages, and business accounts." },
                { question: "Should local businesses use location-based hashtags too?", answer: "Often yes. Local modifiers can help service businesses, cafes, studios, and stores connect with geographically relevant audiences." },
                { question: "Is it better to repeat one hashtag block every time?", answer: "Usually not. Rotating and refining by topic tends to be more useful than posting the same unchanged group on every piece of content." },
              ]} />
            </div>
          </div>

          <div className="space-y-6">
            <RelatedToolsSection currentToolPath="/tools/instagram-hashtag-generator" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default InstagramHashtagGenerator;
