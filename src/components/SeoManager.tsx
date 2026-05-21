import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getFestivalBySlug } from "@/data/festivals";
import { getBlogPostBySlug } from "@/data/blogPosts";

type SeoMeta = {
  title: string;
  description: string;
  keywords: string[];
  canonicalPath: string;
  type?: "website" | "article";
  robots?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
};

const SITE_URL = "https://www.wishspark.xyz";
const SITE_NAME = "WishSpark";
const SITE_OG_IMAGE = `${SITE_URL}/og-image.png`;
const SITE_TWITTER = "@WishSpark";
const DEFAULT_ROBOTS = "index, follow, max-snippet:160, max-image-preview:large, max-video-preview:-1";
const TITLE_MAX_LENGTH = 60;
const DESCRIPTION_MAX_LENGTH = 160;
const DESCRIPTION_MIN_TARGET = 145;
const BLOG_MIN_WORDS_FOR_INDEX = 1000;
const ENABLE_AUTO_THIN_CONTENT_NOINDEX = true;
const BASE_KEYWORDS = [
  "WishSpark",
  "festival greeting card maker",
  "create wishes card online",
  "personalized wishes with name",
  "festival wishes with name",
  "free greeting cards online",
  "WhatsApp greeting card",
  "animated greeting card",
  "festival wishes",
  "online greeting card maker",
];

const TOOL_SEO: Record<string, Omit<SeoMeta, "canonicalPath">> = {
  "/tools/birthday-wishes-generator": {
    title: "Birthday Wishes with Name Generator Free Online | WishSpark",
    description: "Generate personalized happy birthday wishes with name online for free. Create share-ready birthday messages for WhatsApp, Instagram, and greeting cards in seconds.",
    keywords: ["birthday wishes generator", "birthday wishes with name", "happy birthday message generator", "personalized birthday wishes", "birthday wishes for WhatsApp"],
    type: "website",
  },
  "/tools/birthday-card-maker": {
    title: "Birthday Card Maker Free Online | Custom Cards | WishSpark",
    description: "Create birthday cards online for free with custom name and message. Design beautiful birthday greeting cards instantly and share them with friends and family.",
    keywords: ["birthday card maker", "online birthday card maker", "free birthday card creator", "birthday greeting card online", "custom birthday card with name"],
    type: "website",
  },
  "/tools/age-calculator": {
    title: "Age Calculator Free | Exact Age from DOB | WishSpark",
    description: "Use our free age calculator to find exact age from date of birth in years, months, and days. Instantly calculate birthday age and next birthday countdown.",
    keywords: ["age calculator", "calculate age from date of birth", "exact age calculator", "dob age calculator", "birthday age calculator"],
    type: "website",
  },
  "/tools/birthday-countdown": {
    title: "Birthday Countdown Timer Free | Days to Birthday | WishSpark",
    description: "Find out how many days are left until your birthday with a free live birthday countdown timer. Track days, hours, minutes, and seconds online.",
    keywords: ["birthday countdown", "how many days until my birthday", "birthday countdown timer", "days until birthday", "birthday timer online"],
    type: "website",
  },
  "/tools/love-calculator": {
    title: "Love Calculator by Name | Free Love Test | WishSpark",
    description: "Try the free love calculator by name and get a fun true love percentage instantly. Check love compatibility and share your result with friends.",
    keywords: ["love calculator", "love calculator by name", "true love percentage", "love compatibility test", "relationship percentage calculator"],
    type: "website",
  },
  "/tools/crush-calculator": {
    title: "Crush Calculator | Does My Crush Like Me? | WishSpark",
    description: "Use our free crush calculator to check crush compatibility by name. Get a fun answer to does my crush like me and share the result instantly.",
    keywords: ["crush calculator", "does my crush like me", "crush compatibility test", "crush love calculator", "name compatibility crush test"],
    type: "website",
  },
  "/tools/couple-name-generator": {
    title: "Couple Name Generator | Ship Name Creator | WishSpark",
    description: "Generate cute couple names and ship names online for free. Combine two names into fun romantic name ideas for bios, captions, and hashtags.",
    keywords: ["couple name generator", "ship name generator", "couple nickname generator", "combine names generator", "romantic name generator"],
    type: "website",
  },
  "/tools/friendship-calculator": {
    title: "Friendship Calculator | Best Friend Test | WishSpark",
    description: "Check friendship percentage online with our free friendship calculator. Test best friend compatibility by name and share your friendship score.",
    keywords: ["friendship calculator", "friendship percentage test", "best friend compatibility", "friendship compatibility by name", "friendship score calculator"],
    type: "website",
  },
  "/tools/qr-code-generator": {
    title: "Free QR Code Generator | Download PNG | WishSpark",
    description: "Create QR codes online for free from text, links, and messages. Generate a clean QR code instantly and download it as a PNG image.",
    keywords: ["qr code generator", "free qr code generator", "create qr code online", "qr code png download", "generate qr code from url"],
    type: "website",
  },
  "/tools/qr-code-scanner": {
    title: "QR Code Scanner Online | Scan From Image | WishSpark",
    description: "Scan QR codes online from an image or live camera without installing an app. Decode links, text, and QR content instantly in your browser.",
    keywords: ["qr code scanner", "scan qr code online", "scan qr from image", "qr scanner without app", "online qr decoder"],
    type: "website",
  },
  "/tools/instagram-hashtag-generator": {
    title: "Instagram Hashtag Generator Free Online | WishSpark",
    description: "Generate Instagram hashtags for reels, creators, and business posts. Build relevant hashtag sets for reach, discovery, and niche growth.",
    keywords: ["instagram hashtag generator", "hashtags for instagram growth", "instagram hashtag tool", "reels hashtags", "niche hashtag generator"],
    type: "website",
  },
  "/tools/emi-calculator": {
    title: "EMI Calculator | Loan EMI & Interest Online | WishSpark",
    description: "Calculate monthly EMI online for home, car, education, and personal loans. Check EMI, total interest, and total repayment instantly.",
    keywords: ["emi calculator", "loan emi calculator", "monthly emi calculator", "home loan emi", "car loan emi calculator"],
    type: "website",
  },
};

const STATIC_SEO: Record<string, Omit<SeoMeta, "canonicalPath">> = {
  "/": {
    title: "WishSpark | Free Festival Greeting Card Maker Online",
    description: "Create personalized festival wishes with your name for 35+ occasions including Onam, Diwali, Christmas, Eid, and birthdays. Make and share greeting links instantly.",
    keywords: ["festival greeting card maker", "create wishes card online", "festival wishes with name", "personalized greeting card", "free online greeting maker"],
    type: "website",
  },
  "/blog": {
    title: "WishSpark Blog | Greeting Ideas & Festival Tips",
    description: "Read WishSpark blog articles about festival traditions, greeting ideas, WhatsApp sharing tips, and celebration stories for Indian and global occasions.",
    keywords: ["festival blog", "greeting ideas blog", "festival wishes articles", "celebration tips", "WishSpark blog"],
    type: "website",
  },
  "/about": {
    title: "About WishSpark | Free Festival Greeting Card Maker",
    description: "Learn about WishSpark, the free online platform for creating personalized festival greeting cards, animated wishes, and shareable celebration links.",
    keywords: ["about WishSpark", "festival greeting card maker", "personalized greeting platform", "animated wishes site", "free greeting website"],
    type: "website",
  },
  "/how-it-works": {
    title: "How WishSpark Works | Create and Share Festival Greetings",
    description: "See how WishSpark works step by step. Choose a festival, add your name, generate a greeting link, and share animated wishes with friends and family.",
    keywords: ["how festival greeting maker works", "how to create greeting link", "WishSpark tutorial", "share festival wishes online", "animated greeting steps"],
    type: "website",
  },
  "/authors": {
    title: "WishSpark Authors | Editorial Contributors and Content Team",
    description: "Meet the WishSpark authors and contributors behind our festival, relationship, and utility content. Review roles, focus areas, and editorial accountability.",
    keywords: ["WishSpark authors", "content contributors", "editorial team", "festival writers", "tool content experts"],
    type: "website",
  },
  "/editorial-policy": {
    title: "Editorial Policy | WishSpark Content Standards",
    description: "Read the WishSpark editorial policy covering content quality standards, fact checks, human review, updates, corrections, and advertising independence.",
    keywords: ["WishSpark editorial policy", "content quality standards", "fact checking policy", "corrections policy", "ad editorial independence"],
    type: "website",
  },
  "/faq": {
    title: "FAQ | WishSpark Frequently Asked Questions",
    description: "Find answers about creating greeting cards, sharing festival wishes on WhatsApp, supported festivals, privacy, and how WishSpark works.",
    keywords: ["WishSpark FAQ", "festival greeting FAQ", "WhatsApp wishes help", "how to create greeting cards", "festival wishes questions"],
    type: "website",
  },
  "/contact": {
    title: "Contact WishSpark | Festival Greeting Support and Feedback",
    description: "Contact WishSpark for support, feedback, partnerships, and festival suggestions. Get help with greeting cards, tools, and website questions.",
    keywords: ["contact WishSpark", "festival greeting support", "WishSpark feedback", "greeting website contact", "festival suggestion contact"],
    type: "website",
  },
  "/privacy-policy": {
    title: "Privacy Policy | WishSpark Data and Cookie Information",
    description: "Read WishSpark privacy policy to understand how we handle names, cookies, analytics, and ad-related data while protecting user privacy.",
    keywords: ["WishSpark privacy policy", "festival website privacy", "cookie policy", "data protection", "AdSense privacy"],
    type: "website",
  },
  "/terms": {
    title: "Terms of Use | WishSpark Usage Guidelines",
    description: "Review WishSpark terms of use, website rules, and service guidelines for using festival greeting cards, tools, and shared links.",
    keywords: ["WishSpark terms", "terms of use", "website usage guidelines", "festival greeting terms", "service conditions"],
    type: "website",
  },
  "/disclaimer": {
    title: "Disclaimer | WishSpark Important Information",
    description: "Read the WishSpark disclaimer for website information, content usage, third-party links, and limitations related to our greeting tools and pages.",
    keywords: ["WishSpark disclaimer", "website disclaimer", "festival greeting disclaimer", "content disclaimer", "third party links disclaimer"],
    type: "website",
  },
  "/sitemap": {
    title: "Sitemap | WishSpark Pages, Festival Wishes, Blog, and Tools",
    description: "Browse the WishSpark sitemap to find all festival greeting pages, blog articles, greeting tools, and legal pages in one place.",
    keywords: ["WishSpark sitemap", "festival pages list", "greeting tools list", "blog sitemap", "all greeting pages"],
    type: "website",
  },
};

const dedupeKeywords = (keywords: string[]) => Array.from(new Set([...BASE_KEYWORDS, ...keywords]));

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeSpace = (value: string) => value.replace(/\s+/g, " ").trim();

const trimToWordBoundary = (value: string, maxLength: number) => {
  const clean = normalizeSpace(value);
  if (clean.length <= maxLength) return clean;

  const trimmed = clean.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace > Math.floor(maxLength * 0.6)) {
    return `${trimmed.slice(0, lastSpace).trim()}...`;
  }
  return `${trimmed.trim()}...`;
};

const includesPhrase = (text: string, phrase: string) => {
  if (!phrase) return false;
  const re = new RegExp(escapeRegExp(phrase), "i");
  return re.test(text);
};

const buildSeoTitle = (rawTitle: string, primaryKeyword: string) => {
  const keyword = normalizeSpace(primaryKeyword || "festival wishes");
  let title = normalizeSpace(rawTitle);

  if (!includesPhrase(title, "WishSpark") && title.length < TITLE_MAX_LENGTH - 12) {
    title = `${title} | WishSpark`;
  }

  if (title.length > TITLE_MAX_LENGTH) {
    const compact = trimToWordBoundary(`${keyword} | WishSpark`, TITLE_MAX_LENGTH);
    if (compact.length <= TITLE_MAX_LENGTH) {
      return compact;
    }
    return trimToWordBoundary(title, TITLE_MAX_LENGTH);
  }

  return title;
};

const buildSeoDescription = (rawDescription: string, primaryKeyword: string) => {
  const keyword = normalizeSpace(primaryKeyword || "festival wishes");
  let description = normalizeSpace(rawDescription);

  if (!includesPhrase(description, keyword)) {
    description = `${description} Discover practical ${keyword} ideas.`;
  }

  if (!/(create|discover|explore|try|read|share|generate|learn)/i.test(description)) {
    description = `${description} Learn more on WishSpark.`;
  }

  if (description.length < DESCRIPTION_MIN_TARGET) {
    description = `${description} Get usable examples and step-by-step tips.`;
  }

  return trimToWordBoundary(description, DESCRIPTION_MAX_LENGTH);
};

const ensureMetaByName = (name: string) => {
  let meta = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  return meta;
};

const ensureMetaByProperty = (property: string) => {
  let meta = document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  return meta;
};

const ensureCanonicalLink = () => {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  return link;
};

const normalizePath = (pathname: string) => {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
};

const formatDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

const estimateWordCount = (blocks: string[]) =>
  blocks
    .join(" ")
    .replace(/\[[^\]]+\]\([^\)]+\)/g, "")
    .split(/\s+/)
    .filter(Boolean).length;

const buildSeoMeta = (pathname: string): SeoMeta => {
  const normalizedPath = normalizePath(pathname);

  if (STATIC_SEO[normalizedPath]) {
    return {
      ...STATIC_SEO[normalizedPath],
      canonicalPath: normalizedPath,
    };
  }

  if (TOOL_SEO[normalizedPath]) {
    return {
      ...TOOL_SEO[normalizedPath],
      canonicalPath: normalizedPath,
    };
  }

  if (normalizedPath.startsWith("/blog/")) {
    const slug = normalizedPath.replace("/blog/", "");
    const post = getBlogPostBySlug(slug);
    if (post) {
      const estimatedWordCount = estimateWordCount(post.content);
      const isThinArticle = estimatedWordCount < BLOG_MIN_WORDS_FOR_INDEX;
      const shouldNoIndex = post.noIndex || (ENABLE_AUTO_THIN_CONTENT_NOINDEX && isThinArticle);
      return {
        title: post.seoTitle ?? `${post.title} | WishSpark Blog`,
        description: post.seoDescription ?? post.excerpt,
        keywords: post.seoKeywords?.length
          ? post.seoKeywords
          : [
              post.title,
              `${post.category.toLowerCase()} blog`,
              "festival blog article",
              "greeting ideas",
              "celebration tips",
            ],
        canonicalPath: normalizedPath,
        type: "article",
          robots: shouldNoIndex ? "noindex, follow" : undefined,
        articlePublishedTime: formatDate(post.date),
        articleModifiedTime: formatDate(post.updatedDate ?? post.date),
        articleAuthor: post.author,
      };
    }
  }

  const festivalSlug = normalizedPath.slice(1);
  const festival = getFestivalBySlug(festivalSlug);
  if (festival) {
    return {
      title: `${festival.name} Wishes with Name | Card Maker | WishSpark`,
      description: `Create free ${festival.name} wishes with your name and share a personalized ${festival.name} greeting card online. ${festival.description}`,
      keywords: [
        `${festival.name.toLowerCase()} wishes`,
        `${festival.name.toLowerCase()} wishes with name`,
        ...festival.keywords,
        `${festival.name.toLowerCase()} greetings`,
        `${festival.name.toLowerCase()} card maker`,
        `happy ${festival.name.toLowerCase()} wishes`,
      ],
      canonicalPath: normalizedPath,
      type: "website",
    };
  }

  return {
    title: "Page Not Found | WishSpark",
    description: "The page you are looking for does not exist. Browse WishSpark festival wishes, greeting tools, blog articles, and celebration pages from the homepage.",
    keywords: ["page not found", "WishSpark", "festival wishes", "greeting card maker", "404 page"],
    canonicalPath: normalizedPath,
    type: "website",
    robots: "noindex, follow",
  };
};

const SeoManager = () => {
  const location = useLocation();

  const meta = useMemo(() => buildSeoMeta(location.pathname), [location.pathname]);

  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${meta.canonicalPath === "/" ? "/" : meta.canonicalPath}`;
    const keywords = dedupeKeywords(meta.keywords).join(", ");
    const primaryKeyword = meta.keywords[0] ?? "festival wishes";
    const optimizedTitle = buildSeoTitle(meta.title, primaryKeyword);
    const optimizedDescription = buildSeoDescription(meta.description, primaryKeyword);
    const robots = meta.robots ?? DEFAULT_ROBOTS;

    document.title = optimizedTitle;

    ensureMetaByName("description").setAttribute("content", optimizedDescription);
    ensureMetaByName("keywords").setAttribute("content", keywords);
    ensureMetaByName("robots").setAttribute("content", robots);
    ensureMetaByName("googlebot").setAttribute("content", robots);
    ensureMetaByName("google").setAttribute("content", "notranslate");

    ensureMetaByProperty("og:title").setAttribute("content", optimizedTitle);
    ensureMetaByProperty("og:description").setAttribute("content", optimizedDescription);
    ensureMetaByProperty("og:url").setAttribute("content", canonicalUrl);
    ensureMetaByProperty("og:type").setAttribute("content", meta.type ?? "website");
    ensureMetaByProperty("og:site_name").setAttribute("content", SITE_NAME);
    ensureMetaByProperty("og:locale").setAttribute("content", "en_US");
    ensureMetaByProperty("og:image").setAttribute("content", SITE_OG_IMAGE);
    ensureMetaByProperty("og:image:secure_url").setAttribute("content", SITE_OG_IMAGE);
    ensureMetaByProperty("og:image:type").setAttribute("content", "image/png");
    ensureMetaByProperty("og:image:width").setAttribute("content", "1200");
    ensureMetaByProperty("og:image:height").setAttribute("content", "630");
    ensureMetaByProperty("og:image:alt").setAttribute("content", "WishSpark Personalized Festival Wishes preview image");

    ensureMetaByName("twitter:card").setAttribute("content", "summary_large_image");
    ensureMetaByName("twitter:title").setAttribute("content", optimizedTitle);
    ensureMetaByName("twitter:description").setAttribute("content", optimizedDescription);
    ensureMetaByName("twitter:site").setAttribute("content", SITE_TWITTER);
    ensureMetaByName("twitter:url").setAttribute("content", canonicalUrl);
    ensureMetaByName("twitter:image").setAttribute("content", SITE_OG_IMAGE);
    ensureMetaByName("twitter:image:alt").setAttribute("content", "WishSpark Personalized Festival Wishes preview image");

    const canonicalLink = ensureCanonicalLink();
    canonicalLink.setAttribute("href", canonicalUrl);

    const articlePublishedMeta = ensureMetaByProperty("article:published_time");
    const articleModifiedMeta = ensureMetaByProperty("article:modified_time");
    const articleAuthorMeta = ensureMetaByProperty("article:author");

    if (meta.articlePublishedTime) {
      articlePublishedMeta.setAttribute("content", meta.articlePublishedTime);
    } else {
      articlePublishedMeta.remove();
    }

    if (meta.articleAuthor) {
      articleAuthorMeta.setAttribute("content", meta.articleAuthor);
    } else {
      articleAuthorMeta.remove();
    }

    if (meta.articleModifiedTime) {
      articleModifiedMeta.setAttribute("content", meta.articleModifiedTime);
    } else {
      articleModifiedMeta.remove();
    }

    // Structured Data (Schema.org)
    let schema: object | null = null;
    const normalizedPath = normalizePath(location.pathname);

    if (meta.type === "article") {
      schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": optimizedTitle,
        "description": optimizedDescription,
        "url": canonicalUrl,
        "image": SITE_OG_IMAGE,
        "datePublished": meta.articlePublishedTime ?? new Date().toISOString(),
        "dateModified": meta.articleModifiedTime ?? new Date().toISOString(),
        "author": {
          "@type": "Person",
          "name": meta.articleAuthor ?? "WishSpark Team"
        },
        "publisher": {
          "@type": "Organization",
          "name": SITE_NAME,
          "url": SITE_URL,
          "logo": {
            "@type": "ImageObject",
            "url": `${SITE_URL}/favicon.svg`
          }
        }
      };
    } else if (TOOL_SEO[normalizedPath]) {
      schema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": optimizedTitle,
        "description": optimizedDescription,
        "url": canonicalUrl,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "publisher": {
          "@type": "Organization",
          "name": SITE_NAME,
          "url": SITE_URL
        }
      };
    } else if (normalizedPath === "/") {
      schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": SITE_NAME,
        "url": SITE_URL,
        "description": optimizedDescription,
      };
    }

    let schemaScript = document.head.querySelector("#schema-org") as HTMLScriptElement | null;
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement("script");
        schemaScript.setAttribute("type", "application/ld+json");
        schemaScript.setAttribute("id", "schema-org");
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    } else if (schemaScript) {
      schemaScript.remove();
    }

    // Organization schema — site-wide for E-E-A-T
    let orgScript = document.head.querySelector("#org-schema") as HTMLScriptElement | null;
    if (!orgScript) {
      orgScript = document.createElement("script");
      orgScript.setAttribute("type", "application/ld+json");
      orgScript.setAttribute("id", "org-schema");
      document.head.appendChild(orgScript);
    }
    orgScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": SITE_NAME,
      "url": SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/og-image.png`,
        "width": 1200,
        "height": 630
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "support@wishspark.xyz",
        "contactType": "customer support",
        "availableLanguage": ["English"]
      },
      "sameAs": []
    });
  }, [meta, location.pathname]);

  return null;
};

export default SeoManager;
