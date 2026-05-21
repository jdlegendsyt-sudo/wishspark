import { useState, useEffect, Suspense } from "react";
import { useLocation, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GiftBox from "@/components/GiftBox";
import JsonLd from "@/components/JsonLd";
import { getFestivalBlogPost } from "@/data/blogCoverage";
import DiwaliLamp from "@/components/DiwaliLamp";
import EasterEgg from "@/components/EasterEgg";
import GreetingReveal from "@/components/GreetingReveal";
import CreateGreeting from "@/components/CreateGreeting";
import { getFestivalBySlug } from "@/data/festivals";
import { getFestivalArticle } from "@/data/festivalArticles";
import { getFestivalFaqs } from "@/data/festivalFaqs";
import FaqAccordion from "@/components/FaqAccordion";
import { Button } from "@/components/ui/button";
import AdBanner from "@/components/AdBanner";
import SeoBreadcrumbs from "@/components/SeoBreadcrumbs";

const FestivalPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const senderName = searchParams.get("from");
  const slug = location.pathname.replace(/^\/+|\/+$/g, "");
  const festival = getFestivalBySlug(slug);
  const festivalFaqs = festival ? getFestivalFaqs(festival) : [];

  const [giftOpened, setGiftOpened] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [showCreate, setShowCreate] = useState(!senderName);
  const [timeoutExpired, setTimeoutExpired] = useState(false);
  const dedicatedBlogPost = festival ? getFestivalBlogPost(festival.slug) : undefined;

  const isEaster = festival?.slug === "easter-wishes";
  const isDiwali = festival?.slug === "diwali-wishes";
  useEffect(() => {
    if (senderName && !showCreate && !giftOpened) {
      const timer = setTimeout(() => {
        setTimeoutExpired(true);
      }, 5 * 60 * 1000);
      return () => clearTimeout(timer);
    }
  }, [senderName, showCreate, giftOpened]);

  if (!festival) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-6xl">😕</p>
          <h1 className="text-2xl font-display font-bold text-foreground">Festival Not Found</h1>
          <Link to="/">
            <Button variant="outline" className="border-gold/30">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleGiftOpen = () => {
    setGiftOpened(true);
    setShowGreeting(true);
  };

  // Viewing a greeting (has sender name)
  if (senderName && !showCreate) {
    // Fullscreen gift box / easter egg
    if (!giftOpened && !showGreeting && !timeoutExpired) {
      return (
        <div className="fixed inset-0 bg-background z-50 flex items-center justify-center overflow-hidden">
            {isEaster ? (
              <EasterEgg senderName={senderName} accentColor={festival.accentColor} onOpen={handleGiftOpen} />
            ) : isDiwali ? (
              <DiwaliLamp senderName={senderName} accentColor={festival.accentColor} onOpen={handleGiftOpen} />
            ) : (
              <GiftBox senderName={senderName} accentColor={festival.accentColor} onOpen={handleGiftOpen} />
            )}
        </div>
      );
    }

    // Fullscreen greeting popup
    if (showGreeting) {
      return (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full h-full flex flex-col items-center justify-center px-4 py-4 overflow-hidden">
              <div className="flex-1 flex items-center justify-center w-full max-w-2xl">
                <GreetingReveal festival={festival} senderName={senderName} />
              </div>
              <div className="shrink-0 pb-4 md:pb-6">
                <Button
                  onClick={() => setShowCreate(true)}
                  className="bg-gold-gradient text-primary-foreground hover:opacity-90 font-semibold shadow-gold"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Your Own {festival.name} Greeting
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      );
    }

    // After timeout
    return (
      <div className="min-h-screen bg-background relative">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {isEaster ? (
            <EasterEgg senderName={senderName} accentColor={festival.accentColor} onOpen={handleGiftOpen} />
          ) : isDiwali ? (
            <DiwaliLamp senderName={senderName} accentColor={festival.accentColor} onOpen={handleGiftOpen} />
          ) : (
            <GiftBox senderName={senderName} accentColor={festival.accentColor} onOpen={handleGiftOpen} />
          )}
        </main>
        <Footer />
      </div>
    );
  }

  // Creating a greeting
  return (
    <div className="min-h-screen bg-background relative">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <SeoBreadcrumbs
          items={[
            { label: "Festival Wishes", href: "/#choose-festival" },
            { label: `${festival.name} Wishes` },
          ]}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 space-y-4"
        >
          <motion.div
            className="text-6xl md:text-8xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            {festival.emoji}
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gold-gradient glow-gold">
            {festival.name} Wishes — {festival.greeting}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {festival.description} Create free {festival.name} wishes card with your name and share online!
          </p>
        </motion.div>

        <CreateGreeting festival={festival} />

        <div className="max-w-4xl mx-auto my-8">
          <Suspense fallback={null}>
            <AdBanner adSlot="FESTIVAL_TOP" adFormat="horizontal" className="max-w-4xl mx-auto" />
          </Suspense>
        </div>

        <section className="max-w-2xl mx-auto mt-16 space-y-6">
          <div className="bg-glass rounded-2xl p-6 md:p-8 border border-gold/10">
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">
              About {festival.name}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {festival.longDescription}
            </p>
          </div>

          <div className="bg-glass rounded-2xl p-6 md:p-8 border border-gold/10">
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">
              How to Send {festival.name} Wishes
            </h2>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span>
                <span>Enter your name in the form above</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span>
                <span>Click "Create Greeting" to generate your personalized link</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">3</span>
                <span>Share the link via WhatsApp or any social media</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">4</span>
                <span>Your friend opens the link and sees a surprise gift from you!</span>
              </li>
            </ol>
          </div>

          <div className="max-w-2xl mx-auto">
            <Suspense fallback={null}>
              <AdBanner adSlot="FESTIVAL_MID" adFormat="horizontal" className="max-w-2xl mx-auto" />
            </Suspense>
          </div>

          {(() => {
            const article = getFestivalArticle(festival.slug);
            if (!article) return null;
            return (
              <div className="bg-glass rounded-2xl p-6 md:p-8 border border-gold/10">
                <h2 className="text-xl font-display font-semibold text-foreground mb-4">
                  {article.title}
                </h2>
                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  {article.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>

                {dedicatedBlogPost ? (
                  <div className="mt-8 rounded-2xl border border-gold/20 bg-primary/5 p-5">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Detailed Reading</p>
                    <h2 className="text-xl font-display font-semibold text-foreground mb-2">Read the full {festival.name} guide</h2>
                    <p className="text-sm text-muted-foreground mb-4">{dedicatedBlogPost.excerpt}</p>
                    <Link
                      to={`/blog/${dedicatedBlogPost.slug}`}
                      className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                    >
                      Open the complete article
                    </Link>
                  </div>
                ) : null}
              </div>
            );
          })()}

          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">
              Frequently Asked Questions About {festival.name}
            </h2>
            <FaqAccordion
              items={festivalFaqs.map((faq) => ({
                question: faq.question,
                answer: faq.answer,
              }))}
            />
          </div>

          {festivalFaqs.length > 0 && (
            <JsonLd data={{
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: festivalFaqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            }} />
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FestivalPage;
