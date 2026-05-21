import { Fragment, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getBlogPostBySlug, blogPosts, getAuthorProfile } from "@/data/blogPosts";
import { festivals } from "@/data/festivals";
import {
  getFestivalSlugByBlogSlug,
  getToolPathByBlogSlug,
} from "@/data/blogCoverage";
import { Button } from "@/components/ui/button";
import AdBanner from "@/components/AdBanner";
import { toast } from "@/hooks/use-toast";
import SeoBreadcrumbs from "@/components/SeoBreadcrumbs";

const renderInlineContent = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="text-foreground font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      if (href.startsWith("/")) {
        return (
          <Link key={index} to={href} className="text-primary hover:underline font-medium">
            {label}
          </Link>
        );
      }
      return (
        <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
          {label}
        </a>
      );
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
};

const headingToId = (heading: string) =>
  heading
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const parseDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-6xl">📝</p>
          <h1 className="text-2xl font-display font-bold text-foreground">Article Not Found</h1>
          <Link to="/blog">
            <Button variant="outline" className="border-gold/30">Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const headings = useMemo(
    () =>
      post.content
        .filter((block) => block.startsWith("## ") || block.startsWith("### "))
        .map((heading) => {
          const isH3 = heading.startsWith("### ");
          const label = heading.replace(/^###?\s/, "");
          return { id: headingToId(label), label, depth: isH3 ? 3 : 2 };
        }),
    [post.content],
  );

  const wordCount = useMemo(
    () =>
      post.content
        .join(" ")
        .replace(/\[[^\]]+\]\([^\)]+\)/g, "")
        .split(/\s+/)
        .filter(Boolean).length,
    [post.content],
  );

  const isThinContent = wordCount < 1000;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url });
      } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied!", description: "Share it with your friends." });
      } catch {
        toast({ title: "Copy failed", description: "Please copy the URL from your browser address bar." });
      }
    }
  };

  const related = useMemo(() => {
    const curated = (post.relatedSlugs ?? [])
      .map((slugItem) => blogPosts.find((candidate) => candidate.slug === slugItem))
      .filter((candidate): candidate is (typeof blogPosts)[number] => Boolean(candidate));

    const byCategory = blogPosts
      .filter((candidate) => candidate.slug !== post.slug && candidate.category === post.category)
      .sort((a, b) => parseDate(b.date) - parseDate(a.date));

    const byTool = blogPosts
      .filter(
        (candidate) =>
          candidate.slug !== post.slug &&
          !!post.toolPath &&
          !!candidate.toolPath &&
          candidate.toolPath === post.toolPath,
      )
      .sort((a, b) => parseDate(b.date) - parseDate(a.date));

    return Array.from(new Set([...curated, ...byCategory, ...byTool])).slice(0, 3);
  }, [post]);

  const authorProfile = getAuthorProfile(post.author);
  const mappedFestivalSlug = getFestivalSlugByBlogSlug(post.slug);
  const mappedFestival = mappedFestivalSlug
    ? festivals.find((festivalItem) => festivalItem.slug === mappedFestivalSlug)
    : undefined;
  const mappedToolPath = post.toolPath ?? getToolPathByBlogSlug(post.slug);
  const callToActionPath = mappedToolPath ?? (mappedFestival ? `/${mappedFestival.slug}` : "/");
  const callToActionLabel = mappedToolPath
    ? (post.toolLabel ?? "Open Matching Tool")
    : mappedFestival
      ? `Open ${mappedFestival.name} Wishes Page`
      : "Create a Greeting";
  const callToActionText = mappedToolPath
    ? "Use the matching free tool to put the advice from this article into practice right away."
    : mappedFestival
      ? `Generate and share a personalized ${mappedFestival.name} greeting from the linked festival page.`
      : "Create a free personalized festival greeting and share it with your loved ones.";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-3xl">
        {/* Breadcrumb Navigation */}
        <SeoBreadcrumbs
          items={[
            { label: "Blog", href: "/blog" },
            { label: post.title },
          ]}
        />

        {/* Article header */}
        <article>
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                {post.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">{post.excerpt}</p>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true">👤</span> {post.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true">📅</span> {post.date}
                </span>
                {post.updatedDate && post.updatedDate !== post.date && (
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden="true">🔄</span> Updated: {post.updatedDate}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true">⏱️</span> {post.readTime}
                </span>
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true">📝</span> {wordCount.toLocaleString()} words
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="border-gold/20 text-muted-foreground hover:text-primary"
              >
                <span aria-hidden="true" className="mr-1">🔗</span> Share
              </Button>
            </div>
          </header>

          <AdBanner adSlot="BLOG_POST_TOP" adFormat="horizontal" className="mb-8" />

          {headings.length > 0 ? (
            <nav className="bg-glass rounded-2xl p-5 border border-gold/10 mb-8" aria-label="Table of contents">
              <h2 className="text-base font-display font-semibold text-foreground mb-3">In this article</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {headings.map((heading) => (
                  <li key={heading.id} className={heading.depth === 3 ? "pl-4" : ""}>
                    <a href={`#${heading.id}`} className="hover:text-primary transition-colors">
                      {heading.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {isThinContent ? (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-8 text-sm text-amber-100">
              This article is being expanded as part of our editorial quality refresh. For now, use the related articles below for deeper context.
            </div>
          ) : null}

          {/* Article content */}
          <div className="space-y-5">
            {post.content.map((block, index) => {
              if (block.startsWith("## ")) {
                const heading = block.slice(3);
                return (
                  <h2 id={headingToId(heading)} key={index} className="text-2xl font-display font-semibold text-foreground pt-3 scroll-mt-24">
                    {heading}
                  </h2>
                );
              }

              if (block.startsWith("### ")) {
                const heading = block.slice(4);
                return (
                  <h3 id={headingToId(heading)} key={index} className="text-xl font-display font-semibold text-foreground pt-2 scroll-mt-24">
                    {heading}
                  </h3>
                );
              }

              return (
                <p key={index} className="text-foreground/90 leading-relaxed text-[15px]">
                  {renderInlineContent(block)}
                </p>
              );
            })}
          </div>

        </article>

        {mappedFestival || mappedToolPath ? (
          <section className="bg-glass rounded-2xl p-6 border border-gold/10 mt-10">
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">Quick Links for This Topic</h2>
            <div className="flex flex-wrap gap-3">
              {mappedFestival ? (
                <Link to={`/${mappedFestival.slug}`}>
                  <Button variant="outline" className="border-gold/20 hover:border-gold/40">
                    {mappedFestival.emoji} Open {mappedFestival.name} Wishes Page
                  </Button>
                </Link>
              ) : null}

              {mappedToolPath ? (
                <Link to={mappedToolPath}>
                  <Button variant="outline" className="border-gold/20 hover:border-gold/40">
                    Open Matching Tool
                  </Button>
                </Link>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* Author box */}
        <div className="bg-glass rounded-2xl p-6 border border-gold/10 mt-12">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">About the Author</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl">
              ✍️
            </div>
            <div>
              <p className="font-display font-semibold text-foreground">{authorProfile.name}</p>
              <p className="text-xs text-muted-foreground">{authorProfile.role}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            {authorProfile.bio}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Focus: {authorProfile.focus}
          </p>
        </div>

        {/* CTA */}
        <div className="bg-glass rounded-2xl p-6 md:p-8 border border-gold/20 mt-8 text-center">
          <p className="text-lg font-display font-semibold text-foreground mb-2">
            Ready to take the next step?
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {callToActionText}
          </p>
          <Link to={callToActionPath}>
            <Button className="bg-gold-gradient text-primary-foreground hover:opacity-90 font-semibold shadow-gold">
              {callToActionLabel}
            </Button>
          </Link>
        </div>

        {/* Related posts */}
        <section className="mt-12">
          <h2 className="text-xl font-display font-semibold text-foreground mb-6">
            You might also enjoy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((relPost) => (
              <Link
                key={relPost.slug}
                to={`/blog/${relPost.slug}`}
                className="group block bg-glass rounded-xl p-4 border border-gold/10 hover:border-gold/30 transition-all"
              >
                <span className="text-xl mb-2 block">{relPost.emoji}</span>
                <h3 className="text-sm font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                  {relPost.title}
                </h3>
                <p className="text-xs text-muted-foreground">{relPost.readTime}</p>
              </Link>
            ))}
          </div>
        </section>

        <AdBanner adSlot="BLOG_POST_BOTTOM" adFormat="horizontal" className="mt-8" />

        {/* Article Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt,
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://www.wishspark.xyz/blog/${post.slug}`,
              },
              wordCount,
              keywords: post.seoKeywords?.join(", "),
              image: "https://www.wishspark.xyz/og-image.png",
              author: {
                "@type": "Person",
                name: authorProfile.name,
                jobTitle: authorProfile.role,
                description: authorProfile.bio,
                url: authorProfile.profileUrl,
              },
              datePublished: new Date(post.date).toISOString(),
              dateModified: new Date(post.updatedDate ?? post.date).toISOString(),
              publisher: {
                "@type": "Organization",
                name: "WishSpark",
                url: "https://www.wishspark.xyz",
                logo: {
                  "@type": "ImageObject",
                  url: "https://www.wishspark.xyz/og-image.png",
                },
              },
            }),
          }}
        />

        {/* FAQ Schema — auto-extracted from ### headings inside FAQ section */}
        {(() => {
          const faqPairs: Array<{ question: string; answer: string }> = [];
          let inFaq = false;
          for (let i = 0; i < post.content.length; i++) {
            const block = post.content[i];
            if (block.startsWith("## ") && /faq|frequently asked/i.test(block)) {
              inFaq = true;
              continue;
            }
            if (inFaq && block.startsWith("## ")) break;
            if (inFaq && block.startsWith("### ")) {
              const question = block.replace(/^###\s*/, "");
              const answerParts: string[] = [];
              for (let j = i + 1; j < post.content.length; j++) {
                if (post.content[j].startsWith("## ") || post.content[j].startsWith("### ")) break;
                answerParts.push(post.content[j]);
              }
              if (answerParts.length > 0) {
                faqPairs.push({ question, answer: answerParts.join(" ") });
              }
            }
          }
          if (faqPairs.length === 0) return null;
          return (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faqPairs.map((faq) => ({
                    "@type": "Question",
                    name: faq.question,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: faq.answer,
                    },
                  })),
                }),
              }}
            />
          );
        })()}
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
