import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Link as LinkIcon, QrCode, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import Header from "@/components/Header";
import SeoBreadcrumbs from "@/components/SeoBreadcrumbs";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AdBanner from "@/components/AdBanner";
import JsonLd from "@/components/JsonLd";
import FaqAccordion from "@/components/FaqAccordion";
import RelatedToolsSection from "@/components/RelatedToolsSection";
import { toast } from "@/hooks/use-toast";

const QRCodeGenerator = () => {
  const [input, setInput] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    const value = input.trim();
    if (!value) {
      toast({ title: "Enter text or a URL", description: "Add the content you want to convert into a QR code.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const url = await QRCode.toDataURL(value, {
        width: 320,
        margin: 2,
        errorCorrectionLevel: "M",
        color: {
          dark: "#111827",
          light: "#ffffff",
        },
      });
      setQrDataUrl(url);
      toast({ title: "QR code generated", description: "Your QR code is ready to preview and download." });
    } catch {
      toast({ title: "Generation failed", description: "Try again with a shorter or cleaner input.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "wishspark-qr-code.png";
    link.click();
  };

  const handleCopyInput = async () => {
    if (!input.trim()) return;
    await navigator.clipboard.writeText(input.trim());
    toast({ title: "Copied", description: "The QR source text has been copied." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebApplication", name: "QR Code Generator", url: "https://www.wishspark.xyz/tools/qr-code-generator", description: "Create QR codes online for free from text, URLs, phone numbers, and messages. Generate a QR code instantly and download it as a PNG.", applicationCategory: "UtilityApplication", operatingSystem: "All", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, publisher: { "@type": "Organization", name: "WishSpark" } }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [
        { "@type": "Question", name: "How do I create a QR code for free?", acceptedAnswer: { "@type": "Answer", text: "Enter the text or URL you want to encode, click Generate QR Code, then preview and download the PNG file instantly." } },
        { "@type": "Question", name: "Can I make a QR code for a website link?", acceptedAnswer: { "@type": "Answer", text: "Yes. Paste any valid website URL and the generator will convert it into a scannable QR code." } },
        { "@type": "Question", name: "Do QR codes created here expire?", acceptedAnswer: { "@type": "Answer", text: "No. Static QR codes created from plain text or URLs do not expire unless the destination content changes or becomes unavailable." } },
        { "@type": "Question", name: "Can I download the QR code image?", acceptedAnswer: { "@type": "Answer", text: "Yes. After generation, use the download button to save your QR code as a PNG image." } },
        { "@type": "Question", name: "Is this QR generator safe to use?", acceptedAnswer: { "@type": "Answer", text: "Yes. The QR code is generated in your browser from the content you enter. Sensitive data should still be shared carefully." } }
      ] }} />

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <SeoBreadcrumbs
          items={[
            { label: "Tools", href: "/#fun-tools" },
            { label: "QR Code Generator" },
          ]}
        />
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <motion.div className="text-6xl mb-4" animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 2.4 }}>🔳</motion.div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gold-gradient mb-4">Free QR Code Generator</h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Create a clean QR code online for links, contact details, plain text, payment instructions, event pages, or product labels. Generate and download in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 mb-10">
          <section className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/20 shadow-gold">
            <div className="flex items-center gap-2 mb-4 text-foreground">
              <QrCode className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-semibold">Generate your QR code</h2>
            </div>
            <label className="text-sm font-medium text-foreground block mb-2">Text or URL</label>
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Example: https://www.wishspark.xyz or your custom message"
              className="min-h-[140px] bg-secondary/50 border-gold/20"
            />
            <div className="flex flex-wrap gap-3 mt-4">
              <Button onClick={handleGenerate} disabled={loading} className="bg-gold-gradient text-primary-foreground hover:opacity-90">
                <QrCode className="w-4 h-4 mr-2" />
                {loading ? "Generating..." : "Generate QR Code"}
              </Button>
              <Button variant="outline" onClick={handleCopyInput} className="border-gold/30 hover:bg-gold/10">
                <Copy className="w-4 h-4 mr-2" />
                Copy Input
              </Button>
            </div>
          </section>

          <aside className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10 flex flex-col items-center justify-center min-h-[360px]">
            {qrDataUrl ? (
              <>
                <img src={qrDataUrl} alt="Generated QR code preview" className="w-72 h-72 rounded-2xl bg-white p-4 shadow-lg" />
                <div className="flex flex-wrap gap-3 mt-5 justify-center">
                  <Button onClick={handleDownload} className="bg-gold-gradient text-primary-foreground hover:opacity-90">
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </Button>
                  {input.trim().startsWith("http") && (
                    <a href={input.trim()} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="border-gold/30 hover:bg-gold/10">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Open Link
                      </Button>
                    </a>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center space-y-3 max-w-sm">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-primary/10 flex items-center justify-center text-4xl">📱</div>
                <p className="text-foreground font-medium">Your QR preview will appear here</p>
                <p className="text-sm text-muted-foreground">Use it for menus, digital business cards, support links, product packaging, Wi-Fi instructions, and event check-ins.</p>
              </div>
            )}
          </aside>
        </div>

        <section className="mb-10 bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
          <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Introduction</h2>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              A QR code generator is one of the most practical utilities for any modern website because it solves a simple but common problem: moving information from a screen or printed surface into a phone with almost no friction. Instead of asking users to type a long URL, copy a payment note, search for a product page, or manually save contact details, a QR code provides a fast bridge between offline and online interactions. That convenience makes it useful for businesses, freelancers, teachers, event organizers, restaurants, and ordinary users who want a clean way to share information.
            </p>
            <p>
              The best QR tools are not just fast. They also need to be reliable and easy to understand. When someone creates a QR code for a menu, an invoice link, a WhatsApp contact, or a product landing page, they expect the output to scan correctly on different devices and to download cleanly for later use. This page is designed with that practical requirement in mind. You enter text or a URL, generate the QR code instantly, preview it clearly, and download it as a PNG image ready for websites, posters, labels, handouts, or social media assets.
            </p>
            <p>
              On WishSpark, the goal is to make utilities feel professional rather than gimmicky. That means the interface stays focused, the output remains usable, and the content around the tool explains when and why to use it properly. If you are building a campaign, printing a flyer, sharing a Google Form, or creating a simple call-to-action for customers, this QR code generator gives you a fast and production-friendly starting point.
            </p>
          </div>
        </section>

        <AdBanner adSlot="TOOL_MID" adFormat="horizontal" className="mb-10" />

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <div className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Detailed Explanation: When a QR Code Generator Becomes Genuinely Useful</h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  QR codes are most valuable when they remove friction from a real task. A restaurant can attach a QR code to each table so guests open the menu in one tap. A consultant can add a QR code to a printed brochure so prospects land directly on a booking page. A retailer can place a QR code on packaging so buyers access setup instructions, warranty details, or reorder links without searching manually. In each of these situations, the QR code is not decoration. It is a shortcut that reduces user effort and improves completion rates.
                </p>
                <p>
                  There is also a trust and usability angle. Long URLs can look messy, especially on printed materials where visual clarity matters. A QR code keeps the surface cleaner while still giving the user a direct route to the destination. This is helpful for posters, business cards, event stands, and educational handouts where space is limited. The more direct the experience feels, the more likely users are to scan and act. That is why good QR implementation often improves both convenience and conversion.
                </p>
                <p>
                  Static QR codes like the ones generated here are ideal for destinations that do not need advanced tracking dashboards. If your target is a stable web page, a support document, a form, a payment note, or a text instruction, a static code is simple and dependable. You generate once, download once, and reuse the image wherever needed. For many small businesses and internal teams, that is enough. There is no need to add complexity when the requirement is straightforward access.
                </p>
                <p>
                  Another reason this tool matters is cross-device behavior. A QR code lets a laptop user transfer a page to a phone instantly, which is especially helpful when the next action belongs on mobile. For example, someone filling a registration form on desktop may want to continue on their phone, someone viewing a travel itinerary might want to save it on mobile, and someone seeing a support guide on a shared monitor may want to open it privately. The QR code becomes a continuation channel instead of forcing manual re-entry.
                </p>
                <p>
                  Good usage still requires judgment. If you place a QR code on a website page that is already being viewed on a phone, it may not add much value because the user is already on the target device. But on signage, packaging, presentations, printed material, and desktop-first workflows, it becomes highly effective. The right context matters. A professional QR code generator should therefore do more than output an image. It should support a workflow where the generated file is easy to preview, trustworthy to scan, and simple to reuse.
                </p>
                <p>
                  That is why this page combines real generation logic with practical guidance. You can use it immediately, but you can also understand where it fits inside business communication, support material, marketing assets, and internal operations. That balance helps the tool provide real value, which is exactly what high-quality utility pages should do.
                </p>
              </div>
            </div>

            <div className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">How to Use This QR Code Generator</h2>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span><span>Paste or type the content you want to encode. This can be a website URL, a short message, a support page, or any text you want people to scan.</span></li>
                <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span><span>Click <strong className="text-foreground">Generate QR Code</strong>. The QR image appears instantly in the preview panel without leaving the page.</span></li>
                <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">3</span><span>Scan the preview once using a phone camera to confirm the destination opens correctly before you publish or print it.</span></li>
                <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">4</span><span>Download the PNG and place it on your design, invoice, label, slide deck, poster, or marketing material where users can scan it comfortably.</span></li>
              </ol>
            </div>

            <div className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Benefits of Using a High-Quality QR Code Tool</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-gold/10 p-4 bg-primary/5"><p className="font-medium text-foreground mb-2">Faster access</p><p>Users move from print or desktop to mobile in one scan instead of typing links manually.</p></div>
                <div className="rounded-2xl border border-gold/10 p-4 bg-primary/5"><p className="font-medium text-foreground mb-2">Cleaner presentation</p><p>Printed materials stay visually simple while still connecting people to full digital content.</p></div>
                <div className="rounded-2xl border border-gold/10 p-4 bg-primary/5"><p className="font-medium text-foreground mb-2">Practical reuse</p><p>Download once and use the same file across packaging, presentations, flyers, posters, and service counters.</p></div>
                <div className="rounded-2xl border border-gold/10 p-4 bg-primary/5"><p className="font-medium text-foreground mb-2">Better engagement</p><p>Well-placed QR codes reduce friction and often improve completion rates for forms, bookings, downloads, and support pages.</p></div>
              </div>
            </div>

            <div className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10 text-sm text-muted-foreground leading-relaxed">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-3">Read the complete guide</h2>
              <p className="mb-4">If you want practical advice on where to place QR codes, how to avoid low-scan designs, and which use cases perform best, read our long-form guide.</p>
              <Link to="/blog/how-to-create-qr-codes-for-free-complete-guide" className="text-primary hover:underline font-medium">How to Create QR Codes for Free (Complete Guide)</Link>
            </div>

            <div>
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
              <FaqAccordion items={[
                { question: "Can I generate a QR code for any website URL?", answer: "Yes. As long as the link is valid and reachable, the generated QR code can point to it." },
                { question: "Will my QR code still work after I download it?", answer: "Yes. The PNG is simply a visual encoding of your text or URL. It remains usable after download and printing." },
                { question: "Is there a limit to what I can encode?", answer: "There are practical limits for very long text, but standard links, phone numbers, notes, and short instructions work well." },
                { question: "Should I test a QR code before publishing it?", answer: "Absolutely. A quick phone scan before printing or sharing helps confirm that the content opens exactly as expected." },
                { question: "Can I use this QR generator for business material?", answer: "Yes. It is suitable for menus, brochures, onboarding guides, product cards, event signage, and internal documents." },
              ]} />
            </div>
          </div>

          <div className="space-y-6">
            <RelatedToolsSection currentToolPath="/tools/qr-code-generator" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default QRCodeGenerator;
