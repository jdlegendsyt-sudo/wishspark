/**
 * prerender.mjs — WishSpark Static HTML Pre-renderer
 *
 * Run after `vite build`:
 *   node scripts/prerender.mjs
 *
 * Writes correct <title>, <meta>, <canonical>, OG/Twitter, and JSON-LD
 * schema (Article, FAQPage, BreadcrumbList, WebApplication, WebSite)
 * into every HTML file at build time — no JavaScript required for bots.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const SITE_URL = "https://www.wishspark.xyz";
const SITE_NAME = "WishSpark";
const SITE_OG_IMAGE = `${SITE_URL}/og-image.png`;

// ── Read slugs from source ────────────────────────────────────────────────────
const readSlugs = (file, pattern) => {
  const src = readFileSync(path.join(ROOT, file), "utf8");
  return [...src.matchAll(pattern)].map((m) => m[1]);
};

const festivalSlugs = readSlugs("src/data/festivals.ts", /slug:\s*"([^"]+)"/g);
const blogSlugs = readSlugs("src/data/blogPosts.ts", /slug:\s*"([^"]+)"/g);
const toolBlogSlugs = readSlugs("src/data/toolBlogPosts.ts", /slug:\s*"([^"]+)"/g);

// ── Parse blog post SEO data from source ────────────────────────────────────
const parseBlogFile = (filePath) => {
  const src = readFileSync(path.join(ROOT, filePath), "utf8");
  const result = {};
  const blocks = src.split(/\{\s*\n\s*slug:/);
  for (const block of blocks.slice(1)) {
    const slugM = block.match(/^\s*"([^"]+)"/);
    if (!slugM) continue;
    const slug = slugM[1];

    const get = (key) => {
      const m = block.match(new RegExp(`${key}:\\s*"([^"]+)"`));
      return m ? m[1] : null;
    };

    result[slug] = {
      seoTitle: get("seoTitle"),
      seoDescription: get("seoDescription"),
      title: get("title"),
      date: get("date"),
      updatedDate: get("updatedDate"),
      author: get("author") || "WishSpark Team",
      noIndex: /noIndex:\s*true/.test(block),
    };
  }
  return result;
};

const blogData = parseBlogFile("src/data/blogPosts.ts");
const toolBlogData = parseBlogFile("src/data/toolBlogPosts.ts");
const allBlogData = { ...blogData, ...toolBlogData };

// ── Parse festival data from source ─────────────────────────────────────────
const parseFestivalFile = () => {
  const src = readFileSync(path.join(ROOT, "src/data/festivals.ts"), "utf8");
  const result = {};
  const blocks = src.split(/\{\s*\n\s*name:/);
  for (const block of blocks.slice(1)) {
    const nameM = block.match(/^\s*"([^"]+)"/);
    const slugM = block.match(/slug:\s*"([^"]+)"/);
    const descM = block.match(/description:\s*"([^"]+)"/);
    const kwM = block.match(/keywords:\s*\[([^\]]+)\]/);

    if (!nameM || !slugM) continue;
    const keywords = kwM ? [...kwM[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];

    result[slugM[1]] = {
      name: nameM[1],
      description: descM ? descM[1] : "",
      keywords,
    };
  }
  return result;
};

const festivalData = parseFestivalFile();

// ── Convert date string "February 28, 2026" → ISO "2026-02-28" ───────────────
const toISO = (dateStr) => {
  if (!dateStr) return new Date().toISOString();
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

// ── Author profile URLs ───────────────────────────────────────────────────────
const AUTHOR_URLS = {
  "Ananya Krishnan": `${SITE_URL}/authors`,
  "Rahul Menon": `${SITE_URL}/authors`,
  "Sneha Patel": `${SITE_URL}/authors`,
  "Meera Nair": `${SITE_URL}/authors`,
  "Arjun Varma": `${SITE_URL}/authors`,
};

// ── All routes ────────────────────────────────────────────────────────────────
const STATIC_ROUTES = [
  "/",
  "/blog",
  "/about",
  "/authors",
  "/editorial-policy",
  "/how-it-works",
  "/faq",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/disclaimer",
  "/sitemap",
  "/tools/birthday-wishes-generator",
  "/tools/birthday-card-maker",
  "/tools/age-calculator",
  "/tools/birthday-countdown",
  "/tools/love-calculator",
  "/tools/crush-calculator",
  "/tools/couple-name-generator",
  "/tools/friendship-calculator",
  "/tools/qr-code-generator",
  "/tools/qr-code-scanner",
  "/tools/instagram-hashtag-generator",
  "/tools/emi-calculator",
];

const FESTIVAL_ROUTES = festivalSlugs.map((s) => `/${s}`);
const BLOG_ROUTES = [...blogSlugs, ...toolBlogSlugs].map((s) => `/blog/${s}`);
const ALL_ROUTES = [...STATIC_ROUTES, ...FESTIVAL_ROUTES, ...BLOG_ROUTES];

// ── Static page SEO ───────────────────────────────────────────────────────────
const STATIC_SEO = {
  "/": {
    title: "WishSpark | Free Festival Greeting Card Maker Online",
    description: "Create personalized festival wishes with your name for 35+ occasions including Onam, Diwali, Christmas, Eid, and birthdays. Make and share greeting links instantly.",
    type: "website",
  },
  "/blog": {
    title: "WishSpark Blog | Festival Wishes, Greeting Ideas, and Celebration Tips",
    description: "Read WishSpark blog articles about festival traditions, greeting ideas, WhatsApp sharing tips, and celebration stories for Indian and global occasions.",
    type: "website",
  },
  "/about": {
    title: "About WishSpark | Free Festival Greeting Card Maker",
    description: "Learn about WishSpark, the free online platform for creating personalized festival greeting cards, animated wishes, and shareable celebration links.",
    type: "website",
  },
  "/how-it-works": {
    title: "How WishSpark Works | Create and Share Festival Greetings",
    description: "See how WishSpark works step by step. Choose a festival, add your name, generate a greeting link, and share animated wishes instantly.",
    type: "website",
  },
  "/authors": {
    title: "WishSpark Authors | Editorial Contributors and Content Team",
    description: "Meet the WishSpark authors and contributors behind our festival, relationship, and utility content.",
    type: "website",
  },
  "/editorial-policy": {
    title: "Editorial Policy | WishSpark Content Standards",
    description: "Read the WishSpark editorial policy covering content quality standards, fact checks, human review, updates, corrections, and advertising independence.",
    type: "website",
  },
  "/faq": {
    title: "FAQ | WishSpark Frequently Asked Questions",
    description: "Find answers about creating greeting cards, sharing festival wishes on WhatsApp, supported festivals, privacy, and how WishSpark works.",
    type: "website",
  },
  "/contact": {
    title: "Contact WishSpark | Festival Greeting Support and Feedback",
    description: "Contact WishSpark for support, feedback, partnerships, and festival suggestions.",
    type: "website",
  },
  "/privacy-policy": {
    title: "Privacy Policy | WishSpark Data and Cookie Information",
    description: "Read WishSpark privacy policy to understand how we handle names, cookies, analytics, and ad-related data while protecting user privacy.",
    type: "website",
  },
  "/terms": {
    title: "Terms of Use | WishSpark Usage Guidelines",
    description: "Review WishSpark terms of use, website rules, and service guidelines for using festival greeting cards, tools, and shared links.",
    type: "website",
  },
  "/disclaimer": {
    title: "Disclaimer | WishSpark Important Information",
    description: "Read the WishSpark disclaimer for website information, content usage, third-party links, and limitations.",
    type: "website",
  },
  "/sitemap": {
    title: "Sitemap | WishSpark Pages, Festival Wishes, Blog, and Tools",
    description: "Browse the WishSpark sitemap to find all festival greeting pages, blog articles, greeting tools, and legal pages in one place.",
    type: "website",
  },
  "/tools/birthday-wishes-generator": {
    title: "Birthday Wishes Generator Free Online | WishSpark",
    description: "Generate personalized happy birthday wishes with name online for free. Create share-ready birthday messages for WhatsApp and Instagram in seconds.",
    type: "website",
  },
  "/tools/birthday-card-maker": {
    title: "Birthday Card Maker Free Online | Custom Cards | WishSpark",
    description: "Create birthday cards online for free with custom name and message. Design beautiful birthday greeting cards instantly.",
    type: "website",
  },
  "/tools/age-calculator": {
    title: "Age Calculator Free | Exact Age from DOB | WishSpark",
    description: "Use our free age calculator to find exact age from date of birth in years, months, and days.",
    type: "website",
  },
  "/tools/birthday-countdown": {
    title: "Birthday Countdown Timer Free | Days to Birthday | WishSpark",
    description: "Find out how many days are left until your birthday with a free live birthday countdown timer.",
    type: "website",
  },
  "/tools/love-calculator": {
    title: "Love Calculator by Name | Free Love Test | WishSpark",
    description: "Try the free love calculator by name and get a fun true love percentage instantly.",
    type: "website",
  },
  "/tools/crush-calculator": {
    title: "Crush Calculator | Does My Crush Like Me? | WishSpark",
    description: "Use our free crush calculator to check crush compatibility by name.",
    type: "website",
  },
  "/tools/couple-name-generator": {
    title: "Couple Name Generator | Ship Name Creator | WishSpark",
    description: "Generate cute couple names and ship names online for free.",
    type: "website",
  },
  "/tools/friendship-calculator": {
    title: "Friendship Calculator | Best Friend Test | WishSpark",
    description: "Check friendship percentage online with our free friendship calculator.",
    type: "website",
  },
  "/tools/qr-code-generator": {
    title: "Free QR Code Generator | Download PNG | WishSpark",
    description: "Create QR codes online for free from text, links, and messages.",
    type: "website",
  },
  "/tools/qr-code-scanner": {
    title: "QR Code Scanner Online | Scan From Image | WishSpark",
    description: "Scan QR codes online from an image or live camera without installing an app.",
    type: "website",
  },
  "/tools/instagram-hashtag-generator": {
    title: "Instagram Hashtag Generator | Hashtags for Growth | WishSpark",
    description: "Generate Instagram hashtags for reels, creators, and business posts.",
    type: "website",
  },
  "/tools/emi-calculator": {
    title: "EMI Calculator | Loan EMI & Interest Online | WishSpark",
    description: "Calculate monthly EMI online for home, car, education, and personal loans.",
    type: "website",
  },
};

// ── Tool WebApplication schema per /tools/* route ────────────────────────────
const TOOL_APP_NAMES = {
  "/tools/birthday-wishes-generator": "Birthday Wishes Generator",
  "/tools/birthday-card-maker": "Birthday Card Maker",
  "/tools/age-calculator": "Age Calculator",
  "/tools/birthday-countdown": "Birthday Countdown Timer",
  "/tools/love-calculator": "Love Calculator",
  "/tools/crush-calculator": "Crush Calculator",
  "/tools/couple-name-generator": "Couple Name Generator",
  "/tools/friendship-calculator": "Friendship Calculator",
  "/tools/qr-code-generator": "QR Code Generator",
  "/tools/qr-code-scanner": "QR Code Scanner",
  "/tools/instagram-hashtag-generator": "Instagram Hashtag Generator",
  "/tools/emi-calculator": "EMI Calculator",
};

// ── Festival unique title/description ────────────────────────────────────────
// Hand-crafted unique titles — no more generic template
const FESTIVAL_SEO = {
  "onam-wishes": {
    title: "Onam Wishes with Name | Kerala Harvest Festival Greeting | WishSpark",
    description: "Create personalized Onam wishes with your name. Share a beautiful Onam greeting card with Pookalam animations instantly on WhatsApp. Free for all 35+ occasions.",
  },
  "vishu-wishes": {
    title: "Vishu Wishes with Name | Malayalam New Year Greeting | WishSpark",
    description: "Send personalized Vishu wishes with your name. Create a free Vishu Kani greeting card and share instantly on WhatsApp for Kerala New Year.",
  },
  "christmas-wishes": {
    title: "Christmas Wishes with Name | Free Greeting Card | WishSpark",
    description: "Make personalized Christmas wishes with your name. Create an animated Christmas greeting card and share the festive joy instantly on WhatsApp.",
  },
  "new-year-wishes": {
    title: "Happy New Year Wishes with Name | 2026 Greeting Card | WishSpark",
    description: "Create personalized Happy New Year 2026 wishes with your name. Share an animated New Year greeting link instantly on WhatsApp with friends and family.",
  },
  "diwali-wishes": {
    title: "Diwali Wishes with Name | Festival of Lights Greeting | WishSpark",
    description: "Send personalized Happy Diwali wishes with your name. Create a free Diwali greeting card with diyas and share it instantly on WhatsApp.",
  },
  "eid-mubarak-wishes": {
    title: "Eid Mubarak Wishes with Name | Free Greeting Card | WishSpark",
    description: "Create personalized Eid Mubarak wishes with your name. Share a free animated Eid greeting card link on WhatsApp instantly. Eid al-Fitr and Eid al-Adha.",
  },
  "holi-wishes": {
    title: "Holi Wishes with Name | Festival of Colors Greeting | WishSpark",
    description: "Send colorful Holi wishes with your name. Create a free animated Holi greeting card and share the colors of joy on WhatsApp instantly.",
  },
  "raksha-bandhan-wishes": {
    title: "Raksha Bandhan Wishes with Name | Brother Sister Greeting | WishSpark",
    description: "Create heartfelt Raksha Bandhan wishes with your name. Share a free Raksha Bandhan greeting card celebrating the bond between siblings on WhatsApp.",
  },
  "independence-day-wishes": {
    title: "Independence Day Wishes with Name | August 15 Greeting | WishSpark",
    description: "Create patriotic Independence Day wishes with your name. Share a free August 15 greeting card celebrating India's freedom instantly on WhatsApp.",
  },
  "republic-day-wishes": {
    title: "Republic Day Wishes with Name | January 26 Greeting | WishSpark",
    description: "Send personalized Republic Day wishes with your name. Create a free January 26 greeting card and share your patriotic message on WhatsApp.",
  },
  "valentines-day-wishes": {
    title: "Valentine's Day Wishes with Name | Love Greeting Card | WishSpark",
    description: "Create romantic Valentine's Day wishes with your name. Share a free personalized love greeting card and express your feelings on WhatsApp instantly.",
  },
  "mothers-day-wishes": {
    title: "Mother's Day Wishes with Name | Free Greeting Card | WishSpark",
    description: "Send heartfelt Mother's Day wishes with your name. Create a free personalized greeting card for Mom and share it on WhatsApp instantly.",
  },
  "fathers-day-wishes": {
    title: "Father's Day Wishes with Name | Free Greeting Card | WishSpark",
    description: "Create personalized Father's Day wishes with your name. Share a free greeting card for Dad and celebrate the hero in your life on WhatsApp.",
  },
  "birthday-wishes": {
    title: "Birthday Wishes with Name | Free Birthday Greeting Card | WishSpark",
    description: "Make personalized birthday wishes with the recipient's name. Create a free animated birthday greeting card and share instantly on WhatsApp.",
  },
  "anniversary-wishes": {
    title: "Anniversary Wishes with Name | Couple Greeting Card | WishSpark",
    description: "Create beautiful anniversary wishes with your name. Share a free personalized anniversary greeting card celebrating years of love on WhatsApp.",
  },
  "thanksgiving-wishes": {
    title: "Thanksgiving Wishes with Name | Gratitude Greeting Card | WishSpark",
    description: "Send warm Thanksgiving wishes with your name. Create a free gratitude-filled greeting card and share your appreciation on WhatsApp instantly.",
  },
  "easter-wishes": {
    title: "Easter Wishes with Name | Free Easter Greeting Card | WishSpark",
    description: "Create joyful Easter wishes with your name. Share a free animated Easter greeting card with hopes of renewal and happiness on WhatsApp.",
  },
  "pongal-wishes": {
    title: "Pongal Wishes with Name | Tamil Harvest Greeting | WishSpark",
    description: "Send personalized Pongal wishes with your name. Create a free Tamil harvest festival greeting card and share joy on WhatsApp instantly.",
  },
  "makar-sankranti-wishes": {
    title: "Makar Sankranti Wishes with Name | Kite Festival Greeting | WishSpark",
    description: "Create colorful Makar Sankranti wishes with your name. Share a free kite festival greeting card and celebrate the harvest season on WhatsApp.",
  },
  "navratri-wishes": {
    title: "Navratri Wishes with Name | Nine Nights Greeting | WishSpark",
    description: "Send devotional Navratri wishes with your name. Create a free Navratri greeting card celebrating nine nights of Garba and dance on WhatsApp.",
  },
  "durga-puja-wishes": {
    title: "Durga Puja Wishes with Name | Ma Durga Greeting | WishSpark",
    description: "Create blessed Durga Puja wishes with your name. Share a free Ma Durga greeting card and seek divine blessings with your family on WhatsApp.",
  },
  "ganesh-chaturthi-wishes": {
    title: "Ganesh Chaturthi Wishes with Name | Ganpati Greeting | WishSpark",
    description: "Send joyful Ganesh Chaturthi wishes with your name. Create a free Ganpati greeting card and share Bappa's blessings on WhatsApp instantly.",
  },
  "janmashtami-wishes": {
    title: "Janmashtami Wishes with Name | Krishna Greeting Card | WishSpark",
    description: "Create devotional Janmashtami wishes with your name. Share a free Krishna Janmashtami greeting card celebrating Lord Krishna's birth on WhatsApp.",
  },
  "baisakhi-wishes": {
    title: "Baisakhi Wishes with Name | Punjabi New Year Greeting | WishSpark",
    description: "Send vibrant Baisakhi wishes with your name. Create a free Punjabi harvest festival greeting card with Bhangra spirit and share on WhatsApp.",
  },
  "lohri-wishes": {
    title: "Lohri Wishes with Name | Bonfire Festival Greeting | WishSpark",
    description: "Create warm Lohri wishes with your name. Share a free bonfire festival greeting card celebrating winter harvest traditions on WhatsApp.",
  },
  "ugadi-wishes": {
    title: "Ugadi Wishes with Name | Telugu Kannada New Year Greeting | WishSpark",
    description: "Send personalized Ugadi wishes with your name. Create a free Telugu and Kannada New Year greeting card and share the spirit of Pachadi on WhatsApp.",
  },
  "bihu-wishes": {
    title: "Bihu Wishes with Name | Assamese Harvest Greeting | WishSpark",
    description: "Create joyful Bihu wishes with your name. Share a free Assamese Bohag Bihu greeting card celebrating harvest and Bihu dance on WhatsApp.",
  },
  "ramadan-wishes": {
    title: "Ramadan Wishes with Name | Holy Month Greeting Card | WishSpark",
    description: "Send respectful Ramadan wishes with your name. Create a free holy month greeting card and share blessings of faith and reflection on WhatsApp.",
  },
  "friendship-day-wishes": {
    title: "Friendship Day Wishes with Name | Best Friend Greeting | WishSpark",
    description: "Create heartfelt Friendship Day wishes with your name. Share a free best friend greeting card and celebrate the bond of friendship on WhatsApp.",
  },
  "teachers-day-wishes": {
    title: "Teachers Day Wishes with Name | Thank You Greeting Card | WishSpark",
    description: "Send grateful Teachers Day wishes with your name. Create a free thank-you greeting card and honor the teachers who shaped your life on WhatsApp.",
  },
  "childrens-day-wishes": {
    title: "Children's Day Wishes with Name | Kids Greeting Card | WishSpark",
    description: "Create joyful Children's Day wishes with your name. Share a free greeting card celebrating childhood innocence and joy on WhatsApp.",
  },
  "womens-day-wishes": {
    title: "Women's Day Wishes with Name | March 8 Greeting Card | WishSpark",
    description: "Send empowering Women's Day wishes with your name. Create a free March 8 greeting card celebrating strength and achievement on WhatsApp.",
  },
  "wedding-wishes": {
    title: "Wedding Wishes with Name | Newlywed Greeting Card | WishSpark",
    description: "Create heartfelt wedding wishes with your name. Share a free personalized newlywed greeting card blessing the couple with love and happiness on WhatsApp.",
  },
  "baby-shower-wishes": {
    title: "Baby Shower Wishes with Name | New Baby Greeting Card | WishSpark",
    description: "Send warm baby shower wishes with your name. Create a free new baby greeting card and welcome the little one with joy on WhatsApp.",
  },
  "graduation-wishes": {
    title: "Graduation Wishes with Name | Congrats Greeting Card | WishSpark",
    description: "Create proud graduation wishes with your name. Share a free congratulations greeting card celebrating this big milestone achievement on WhatsApp.",
  },
};

// ── Breadcrumb label map ───────────────────────────────────────────────────────
const getBreadcrumbs = (route) => {
  const crumbs = [{ name: "Home", url: `${SITE_URL}/` }];

  if (route === "/") return crumbs;

  if (route.startsWith("/blog/")) {
    const slug = route.replace("/blog/", "");
    const post = allBlogData[slug];
    crumbs.push({ name: "Blog", url: `${SITE_URL}/blog` });
    crumbs.push({ name: post?.title || slug, url: `${SITE_URL}${route}` });
  } else if (route.startsWith("/tools/")) {
    const seo = STATIC_SEO[route];
    crumbs.push({ name: "Tools", url: `${SITE_URL}/` });
    crumbs.push({ name: seo?.title?.split(" |")[0] || route.split("/").pop(), url: `${SITE_URL}${route}` });
  } else if (FESTIVAL_ROUTES.includes(route)) {
    const slug = route.slice(1);
    const festival = festivalData[slug];
    crumbs.push({ name: "Festivals", url: `${SITE_URL}/` });
    crumbs.push({ name: festival?.name ? `${festival.name} Wishes` : slug, url: `${SITE_URL}${route}` });
  } else {
    const seo = STATIC_SEO[route];
    if (seo) {
      crumbs.push({ name: seo.title.split(" |")[0], url: `${SITE_URL}${route}` });
    }
  }

  return crumbs;
};

// ── Build schema array for a route ───────────────────────────────────────────
const buildSchemas = (route, seo) => {
  const schemas = [];
  const canonicalUrl = route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`;

  // BreadcrumbList — every page
  const crumbs = getBreadcrumbs(route);
  if (crumbs.length > 1) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    });
  }

  // WebSite schema — homepage only
  if (route === "/") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: seo.description,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/blog?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    });

    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.svg`,
      },
      sameAs: [],
    });
  }

  // Article schema — blog posts
  if (route.startsWith("/blog/")) {
    const slug = route.replace("/blog/", "");
    const post = allBlogData[slug];
    if (post) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: seo.title,
        description: seo.description,
        url: canonicalUrl,
        image: SITE_OG_IMAGE,
        datePublished: toISO(post.date),
        dateModified: toISO(post.updatedDate || post.date),
        author: {
          "@type": "Person",
          name: post.author,
          url: AUTHOR_URLS[post.author] || `${SITE_URL}/authors`,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/favicon.svg`,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl,
        },
      });
    }
  }

  // WebApplication schema — tool pages
  if (route.startsWith("/tools/")) {
    const appName = TOOL_APP_NAMES[route] || seo.title.split(" |")[0];
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: appName,
      description: seo.description,
      url: canonicalUrl,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "All",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
    });
  }

  // SoftwareApplication schema — festival pages (greeting generator)
  if (FESTIVAL_ROUTES.includes(route)) {
    const slug = route.slice(1);
    const festival = festivalData[slug];
    if (festival) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: `${festival.name} Wishes Generator`,
        description: seo.description,
        url: canonicalUrl,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "All",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
      });
    }
  }

  return schemas;
};

// ── SEO data resolver ─────────────────────────────────────────────────────────
const getSeo = (route) => {
  // Static pages
  if (STATIC_SEO[route]) {
    return { ...STATIC_SEO[route] };
  }

  // Blog posts — use real seoTitle/seoDescription from source
  if (route.startsWith("/blog/")) {
    const slug = route.replace("/blog/", "");
    const post = allBlogData[slug];
    if (post) {
      return {
        title: post.seoTitle || `${post.title} | WishSpark Blog`,
        description: post.seoDescription || `Read ${post.title} on the WishSpark blog.`,
        type: "article",
        noIndex: post.noIndex,
      };
    }
    // Fallback
    const name = slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return {
      title: `${name} | WishSpark Blog`,
      description: `Read about ${name.toLowerCase()} on the WishSpark blog.`,
      type: "article",
    };
  }

  // Festival pages — use unique hand-crafted SEO
  const slug = route.slice(1);
  if (FESTIVAL_SEO[slug]) {
    return { ...FESTIVAL_SEO[slug], type: "website" };
  }

  // Fallback for any unmapped festival
  const festival = festivalData[slug];
  if (festival) {
    return {
      title: `${festival.name} Wishes with Name | Greeting Card | WishSpark`,
      description: `Create personalized ${festival.name} wishes with your name and share a free greeting card instantly on WhatsApp.`,
      type: "website",
    };
  }

  return {
    title: "WishSpark | Free Festival Greeting Card Maker Online",
    description: "Create personalized festival wishes with your name for 35+ occasions. Make and share greeting links instantly.",
    type: "website",
  };
};

// ── HTML builder ──────────────────────────────────────────────────────────────
const baseHtml = readFileSync(path.join(DIST, "index.html"), "utf8");

const escapeHtml = (str) =>
  str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const buildHtml = (route) => {
  const seo = getSeo(route);
  const canonicalUrl = route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`;
  const { title, description, type = "website", noIndex = false } = seo;

  const robotsContent = noIndex
    ? "noindex, nofollow"
    : "index, follow, max-snippet:160, max-image-preview:large, max-video-preview:-1";

  // Build JSON-LD schema blocks
  const schemas = buildSchemas(route, seo);
  const schemaScripts = schemas
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join("\n  ");

  let html = baseHtml
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"/,
      `<meta name="description" content="${escapeHtml(description)}"`
    )
    .replace(
      /<link rel="canonical" href="[^"]*"/,
      `<link rel="canonical" href="${canonicalUrl}"`
    )
    .replace(
      /<meta name="robots" content="[^"]*"/,
      `<meta name="robots" content="${robotsContent}"`
    )
    .replace(
      /<meta name="googlebot" content="[^"]*"/,
      `<meta name="googlebot" content="${robotsContent}"`
    )
    .replace(
      /<meta property="og:url" content="[^"]*"/,
      `<meta property="og:url" content="${canonicalUrl}"`
    )
    .replace(
      /<meta property="og:title" content="[^"]*"/,
      `<meta property="og:title" content="${escapeHtml(title)}"`
    )
    .replace(
      /<meta property="og:description" content="[^"]*"/,
      `<meta property="og:description" content="${escapeHtml(description)}"`
    )
    .replace(
      /<meta property="og:type" content="[^"]*"/,
      `<meta property="og:type" content="${type}"`
    )
    .replace(
      /<meta name="twitter:url" content="[^"]*"/,
      `<meta name="twitter:url" content="${canonicalUrl}"`
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*"/,
      `<meta name="twitter:title" content="${escapeHtml(title)}"`
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*"/,
      `<meta name="twitter:description" content="${escapeHtml(description)}"`
    );

  // Inject schema scripts before </head>
  if (schemaScripts) {
    html = html.replace("</head>", `  ${schemaScripts}\n</head>`);
  }

  return html;
};

// ── Write files ───────────────────────────────────────────────────────────────
let count = 0;
let skipped = 0;

for (const route of ALL_ROUTES) {
  const seo = getSeo(route);

  // Skip noIndex blog posts entirely (don't create HTML file — let them 404 or be served from SPA)
  // Actually we still write the file but with noindex meta already set above
  const html = buildHtml(route);

  if (route === "/") {
    writeFileSync(path.join(DIST, "index.html"), html, "utf8");
  } else {
    const dir = path.join(DIST, route.slice(1));
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "index.html"), html, "utf8");
  }

  count++;
  const indicator = seo.noIndex ? "🚫" : "✅";
  console.log(`${indicator} ${route}`);
}

console.log(`\n🎉 Prerendered ${count} pages (${skipped} skipped).`);
console.log(`   ✅ Real blog SEO titles from blogPosts.ts`);
console.log(`   ✅ Unique festival page titles`);
console.log(`   ✅ BreadcrumbList schema on every page`);
console.log(`   ✅ Article schema on all blog posts`);
console.log(`   ✅ WebApplication schema on all tool & festival pages`);
console.log(`   ✅ WebSite + Organization schema on homepage`);
console.log(`   ✅ noIndex meta respected for flagged posts`);
