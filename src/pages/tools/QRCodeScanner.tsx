import { ChangeEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BarcodeFormat,
  BinaryBitmap,
  DecodeHintType,
  HybridBinarizer,
  InvertedLuminanceSource,
  MultiFormatReader,
  RGBLuminanceSource,
} from "@zxing/library";
import jsQR from "jsqr";
import { Camera, Copy, ScanLine, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import SeoBreadcrumbs from "@/components/SeoBreadcrumbs";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import AdBanner from "@/components/AdBanner";
import JsonLd from "@/components/JsonLd";
import FaqAccordion from "@/components/FaqAccordion";
import RelatedToolsSection from "@/components/RelatedToolsSection";
import { toast } from "@/hooks/use-toast";

type BarcodeResult = {
  rawValue?: string;
  format?: string;
};

type BarcodeDetectorLike = {
  detect: (source: CanvasImageSource) => Promise<BarcodeResult[]>;
};

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

const CAMERA_CONSTRAINTS: MediaStreamConstraints[] = [
  {
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: false,
  },
  { video: true, audio: false },
  { video: { facingMode: "user" }, audio: false },
];

const BARCODE_FORMATS = [
  "qr_code",
  "code_128",
  "code_39",
  "code_93",
  "codabar",
  "ean_13",
  "ean_8",
  "itf",
  "upc_a",
  "upc_e",
  "pdf417",
  "aztec",
  "data_matrix",
];

const ZXING_FORMATS = [
  BarcodeFormat.QR_CODE,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.CODE_93,
  BarcodeFormat.CODABAR,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.ITF,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.PDF_417,
  BarcodeFormat.AZTEC,
  BarcodeFormat.DATA_MATRIX,
];

const ZXING_HINTS = new Map<DecodeHintType, unknown>([
  [DecodeHintType.POSSIBLE_FORMATS, ZXING_FORMATS],
  [DecodeHintType.TRY_HARDER, true],
]);

const getBarcodeDetectorConstructor = () => {
  return (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
};

const formatDetectedCodeType = (format?: string) => {
  if (!format) return "Scanned code";
  if (format === "qr_code") return "QR code";
  return format.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const parseWifiPassword = (value: string) => {
  if (!/^WIFI:/i.test(value.trim())) {
    return null;
  }

  const match = value.match(/(?:^|;)P:((?:\\.|[^;])*)/i);
  if (!match) {
    return "";
  }

  return match[1].replace(/\\([\\;,:])/g, "$1");
};

const decodeWithZxing = (imageData: ImageData) => {
  const reader = new MultiFormatReader();
  reader.setHints(ZXING_HINTS);

  const decodeBitmap = (bitmap: BinaryBitmap) => {
    const decoded = reader.decode(bitmap);
    return {
      value: decoded.getText(),
      type: formatDetectedCodeType(BarcodeFormat[decoded.getBarcodeFormat()]?.toLowerCase()),
    };
  };

  try {
    const luminanceSource = new RGBLuminanceSource(imageData.data, imageData.width, imageData.height);
    const normalBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

    try {
      return decodeBitmap(normalBitmap);
    } catch {
      if (normalBitmap.isRotateSupported()) {
        try {
          return decodeBitmap(normalBitmap.rotateCounterClockwise());
        } catch {
          // Try additional fallbacks below.
        }
      }

      const invertedBitmap = new BinaryBitmap(
        new HybridBinarizer(new InvertedLuminanceSource(luminanceSource)),
      );

      try {
        return decodeBitmap(invertedBitmap);
      } catch {
        if (invertedBitmap.isRotateSupported()) {
          return decodeBitmap(invertedBitmap.rotateCounterClockwise());
        }
      }
    }
  } catch {
    return null;
  } finally {
    reader.reset();
  }
};

const QRCodeScanner = () => {
  const [result, setResult] = useState("");
  const [detectedType, setDetectedType] = useState("");
  const [error, setError] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [previewName, setPreviewName] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const scanBusyRef = useRef(false);

  const stopCamera = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    scanBusyRef.current = false;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
  };

  const scanCanvasForCode = async (canvas: HTMLCanvasElement, imageData: ImageData) => {
    const decodedQr = jsQR(imageData.data, imageData.width, imageData.height);
    if (decodedQr?.data) {
      return {
        value: decodedQr.data,
        type: "QR code",
      };
    }

    const BarcodeDetectorApi = getBarcodeDetectorConstructor();

    if (BarcodeDetectorApi) {
      try {
        const detector = new BarcodeDetectorApi({ formats: BARCODE_FORMATS });
        const [barcode] = await detector.detect(canvas);
        if (barcode?.rawValue) {
          return {
            value: barcode.rawValue,
            type: formatDetectedCodeType(barcode.format),
          };
        }
      } catch {
        // Continue with library fallback if detector support is partial or unavailable.
      }
    }

    return decodeWithZxing(imageData);
  };

  const scanFromVideo = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (scanBusyRef.current) {
      frameRef.current = requestAnimationFrame(() => {
        void scanFromVideo();
      });
      return;
    }

    if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      const context = canvas.getContext("2d");
      if (context) {
        scanBusyRef.current = true;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = await scanCanvasForCode(canvas, imageData);
        if (decoded) {
          setResult(decoded.value);
          setDetectedType(decoded.type);
          setError("");
          setIsScanning(false);
          stopCamera();
          toast({ title: `${decoded.type} scanned`, description: "The decoded result is ready below." });
          return;
        }

        scanBusyRef.current = false;
      }
    }

    frameRef.current = requestAnimationFrame(() => {
      void scanFromVideo();
    });
  };

  const getCameraStream = async () => {
    for (const constraints of CAMERA_CONSTRAINTS) {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        // Try the next available camera mode before failing.
      }
    }

    throw new Error("Unable to access any available camera.");
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is not supported in this browser.");
      }

      stopCamera();
      const stream = await getCameraStream();
      streamRef.current = stream;

      setResult("");
      setDetectedType("");
      setIsCameraActive(true);
      setIsScanning(true);
      setError("");
      setPreviewName("Live camera");
    } catch {
      setError("Camera access failed or no compatible device camera was available. You can still scan by uploading an image.");
      setIsCameraActive(false);
      setIsScanning(false);
    }
  };

  const scanImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        void scanCanvasForCode(canvas, imageData).then((decoded) => {
          if (decoded) {
            setResult(decoded.value);
            setDetectedType(decoded.type);
            setError("");
            toast({ title: `${decoded.type} scanned`, description: "The uploaded image was decoded successfully." });
          } else {
            setResult("");
            setDetectedType("");
            setError("No readable QR code or barcode was found in that image.");
          }
        });
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    stopCamera();
    setPreviewName(file.name);
    setResult("");
    setDetectedType("");
    setError("");
    scanImageFile(file);
  };

  const handleCopy = async () => {
    if (!result) return;
    const wifiPassword = parseWifiPassword(result);
    const copyValue = wifiPassword !== null ? wifiPassword : result;
    await navigator.clipboard.writeText(copyValue);
    toast({ title: "Copied", description: "The scanned result has been copied." });
  };

  const getRedirectUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    if (/^(mailto:|tel:|sms:)/i.test(trimmed)) {
      return trimmed;
    }

    if (/^www\./i.test(trimmed)) {
      return `https://${trimmed}`;
    }

    return null;
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    const attachStreamToVideo = async () => {
      if (!isCameraActive || !videoRef.current || !streamRef.current) {
        return;
      }

      try {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        await videoRef.current.play();
        frameRef.current = requestAnimationFrame(() => {
          void scanFromVideo();
        });
      } catch {
        setError("Camera started but the video preview could not play. Try refreshing the page or use image upload instead.");
        stopCamera();
      }
    };

    attachStreamToVideo();
  }, [isCameraActive]);

  const redirectUrl = getRedirectUrl(result);
  const wifiPassword = parseWifiPassword(result);
  const displayResult = wifiPassword !== null ? (wifiPassword ? `Wi-Fi password: ${wifiPassword}` : "Wi-Fi password: (empty)") : result;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebApplication", name: "QR Code Scanner", url: "https://www.wishspark.xyz/tools/qr-code-scanner", description: "Scan QR codes online from an uploaded image or live camera. Decode links, text, and contact data without installing an app.", applicationCategory: "UtilityApplication", operatingSystem: "All", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, publisher: { "@type": "Organization", name: "WishSpark" } }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [
        { "@type": "Question", name: "Can I scan a QR code from an image file?", acceptedAnswer: { "@type": "Answer", text: "Yes. Upload a PNG, JPG, or similar image file and the tool will try to decode the QR code automatically." } },
        { "@type": "Question", name: "Can I scan QR codes using my camera here?", acceptedAnswer: { "@type": "Answer", text: "Yes. If your browser supports camera access and you grant permission, the tool can scan a QR code live from your device camera." } },
        { "@type": "Question", name: "Do I need to install an app to scan a QR code online?", acceptedAnswer: { "@type": "Answer", text: "No. This scanner works directly in your browser for both image uploads and live camera scanning." } },
        { "@type": "Question", name: "What happens after the QR code is decoded?", acceptedAnswer: { "@type": "Answer", text: "The decoded text or link appears on the page so you can copy it or open it if it is a valid URL." } },
        { "@type": "Question", name: "Why might a QR scan fail?", acceptedAnswer: { "@type": "Answer", text: "Scanning can fail if the image is blurry, cropped, low contrast, or the QR code is damaged or too small." } }
      ] }} />

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <SeoBreadcrumbs
          items={[
            { label: "Tools", href: "/#fun-tools" },
            { label: "QR Code Scanner" },
          ]}
        />
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <motion.div className="text-6xl mb-4" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2 }}>📷</motion.div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gold-gradient mb-4">QR Code Scanner Online</h1>
          <p className="text-muted-foreground text-base md:text-lg">Scan QR codes from a live camera feed or uploaded image file and decode the result instantly without installing a separate app.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.95fr] gap-6 mb-10">
          <section className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/20 shadow-gold">
            <div className="flex items-center gap-2 mb-4 text-foreground">
              <ScanLine className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-semibold">Scan a QR code or barcode</h2>
            </div>
            <div className="flex flex-wrap gap-3 mb-4">
              <Button onClick={startCamera} className="bg-gold-gradient text-primary-foreground hover:opacity-90">
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
              <label className="inline-flex items-center">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <span className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gold/30 px-4 py-2 text-sm text-foreground hover:bg-gold/10">
                  <Upload className="w-4 h-4" />
                  Upload QR Image
                </span>
              </label>
              {isCameraActive && (
                <Button variant="outline" onClick={stopCamera} className="border-gold/30 hover:bg-gold/10">Stop Camera</Button>
              )}
            </div>

            <div className="relative rounded-3xl border border-gold/10 bg-secondary/20 overflow-hidden min-h-[320px] flex items-center justify-center">
              {isCameraActive ? (
                <>
                  <video ref={videoRef} className="block w-full min-h-[320px] bg-black object-cover" autoPlay playsInline muted />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
                  <div className="pointer-events-none absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-2xl border border-emerald-400/60 h-40 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]" />
                  <motion.div
                    className="pointer-events-none absolute left-8 right-8 h-0.5 bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.75)]"
                    animate={{ top: ["34%", "66%", "34%"] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-emerald-200">
                    Align the QR code or barcode inside the scan area
                  </div>
                </>
              ) : (
                <div className="text-center px-6 py-12 max-w-md">
                  <div className="w-24 h-24 mx-auto rounded-3xl bg-primary/10 flex items-center justify-center text-4xl mb-3">🔍</div>
                  <p className="text-foreground font-medium mb-2">Camera or upload preview</p>
                  <p className="text-sm text-muted-foreground">Use camera access for quick live scanning, or upload a screenshot, bill, menu, flyer, product label, or ticket image that contains a QR code or barcode.</p>
                  {previewName && <p className="mt-3 text-xs text-muted-foreground">Last source: {previewName}</p>}
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            {isScanning && <p className="text-xs text-muted-foreground mt-3">Scanning in progress. Point the QR code or barcode clearly inside the guide frame.</p>}
            {error && <p className="text-sm text-destructive mt-3">{error}</p>}
          </section>

          <aside className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">Decoded result</h2>
            {result ? (
              <div className="space-y-4">
                {detectedType && (
                  <div className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    {detectedType}
                  </div>
                )}
                <div className="rounded-2xl border border-gold/10 bg-primary/5 p-4 break-words text-sm text-foreground leading-relaxed">{displayResult}</div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleCopy} variant="outline" className="border-gold/30 hover:bg-gold/10">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Result
                  </Button>
                  {redirectUrl && (
                    <a href={redirectUrl} target="_blank" rel="noopener noreferrer">
                      <Button className="bg-gold-gradient text-primary-foreground hover:opacity-90">Open Link</Button>
                    </a>
                  )}
                </div>
                {redirectUrl && (
                  <a href={redirectUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Redirect to Scanned Source
                    </Button>
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">Once a QR code or supported barcode is detected, the decoded text or URL will appear here so you can copy it or open the link immediately.</p>
            )}
          </aside>
        </div>

        <section className="mb-10 bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
          <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Introduction</h2>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              A browser-based QR code scanner is useful because it removes the need for extra apps when you only need to decode one code quickly. Many users land on a QR image from a screenshot, an emailed invoice, a menu PDF, a product box photo, or a desktop presentation and simply want the destination without switching devices or downloading another scanner application. This page is designed for that practical workflow. You can upload an image, try live camera scanning, and view the decoded text or URL immediately.
            </p>
            <p>
              Professional scanning tools are not only about recognition speed. They also need to be understandable, dependable, and flexible. Some people scan from the rear camera of a phone or laptop webcam, while others want to upload an existing image file. Both use cases matter. That is why this page supports camera access where available and also includes an image upload path for situations where the QR code already exists in a screenshot, social media post, or saved document.
            </p>
            <p>
              On a quality tools website, a QR scanner should solve a real task without adding friction of its own. The goal here is not novelty. It is convenience. If you need to extract a URL from a printed leaflet, verify a payment QR before sharing it, or decode a customer support label from a photograph, this scanner gives you a fast and production-friendly option directly in the browser.
            </p>
          </div>
        </section>

        <section className="mb-10 bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
          <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Real-World Use Cases for Online QR Scanning</h2>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Verifying payment QR codes:</strong> Before scanning and paying through a UPI or mobile banking app, you can upload the payment QR here first to verify the merchant URL or account details encoded inside. This simple verification step helps avoid scanning fraudulent sticker overlays placed on top of legitimate payment codes — a common scam at shops and restaurants.
            </p>
            <p>
              <strong className="text-foreground">Extracting links from screenshots:</strong> When someone shares a QR code as a WhatsApp image or Instagram story screenshot, you cannot scan it directly from your phone screen. Upload that screenshot here and the scanner extracts the URL instantly, saving you from the awkward workaround of using a second device.
            </p>
            <p>
              <strong className="text-foreground">Event and travel passes:</strong> Boarding passes, concert tickets, and event registrations often arrive as QR images in email confirmations. If you need to check the encoded booking reference or verify the pass details before the event, an online scanner lets you decode and copy the information without opening the ticketing app.
            </p>
            <p>
              <strong className="text-foreground">Product and packaging labels:</strong> E-commerce sellers, warehouse staff, and quality inspectors frequently need to verify barcodes and QR codes on product packaging. Photographing the label and uploading it here provides a quick cross-check without dedicated barcode scanning hardware.
            </p>
          </div>
        </section>

        <AdBanner adSlot="TOOL_MID" adFormat="horizontal" className="mb-10" />

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <div className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Detailed Explanation: Where an Online QR Scanner Fits Best</h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  QR scanners are most useful when the encoded information is trapped inside an image or physical object and you need to recover it quickly. This happens often in business and everyday workflows. Someone shares a QR code inside a WhatsApp image instead of the actual link. A team member sends a flyer proof for review. A customer photographs a label or invoice. A restaurant menu appears as a poster image in a presentation. In each case, the user does not need a complicated system. They just need the underlying text or destination decoded accurately.
                </p>
                <p>
                  An online scanner helps because it meets users where they already are: inside the browser. That matters for desktop workflows. If a person is reviewing campaign material on a laptop, a browser scanner avoids the extra loop of emailing the image to a phone or searching for a mobile app. Upload, decode, copy, and continue. That kind of low-friction behavior is what makes utility pages genuinely valuable instead of superficial.
                </p>
                <p>
                  Camera support is helpful for quick real-world scanning. For example, a user may want to scan a code printed on packaging, signage, event passes, or a monitor during a meeting. Live scanning is a natural option in those situations. But upload support is equally important because QR codes often appear in screenshots, PDFs, creatives, and saved photos. A production-ready scanner should therefore support both routes, which is why this page includes live camera scanning and image decoding together.
                </p>
                <p>
                  Reliability depends on a few practical factors. Sharp images scan more easily than blurry ones. High contrast improves detection. Larger QR codes generally decode faster than tiny ones. If a code is partially cut off, heavily compressed, or printed with poor contrast, recognition becomes harder. Understanding that helps users troubleshoot failed scans without blaming the tool immediately. Good utility pages explain these realities instead of pretending every input should work perfectly.
                </p>
                <p>
                  Security also matters. Scanning a QR code is easy, but users should still think about where the code leads before opening it. Businesses can use scanners like this one to verify the destination of a code from an invoice, poster, or vendor asset before sharing it further. Individuals can use it to inspect unfamiliar QR content rather than opening it blindly on a phone. That inspection step is a small but meaningful layer of caution.
                </p>
                <p>
                  In short, an online QR scanner earns its place when it saves time, supports real workflows, and gives users clarity. This page is built around those needs. It provides actual decoding logic, supports both upload and live input, and returns the result in a format that is easy to verify, copy, and use immediately.
                </p>
              </div>
            </div>

            <div className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">How to Use the QR Scanner</h2>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span><span>Choose whether you want to scan from a live camera or upload an image that already contains a QR code.</span></li>
                <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span><span>If you use the camera, allow access and point the code clearly at the lens until the tool detects it.</span></li>
                <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">3</span><span>If you upload an image, use a clear file with enough lighting and contrast so the QR modules are visible.</span></li>
                <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">4</span><span>Review the decoded result, copy it if needed, and open it only after confirming that the destination looks safe and expected.</span></li>
              </ol>
            </div>

            <div className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Benefits of an Online QR Scanner</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-gold/10 p-4 bg-primary/5"><p className="font-medium text-foreground mb-2">No extra app required</p><p>Useful for quick scans on desktop and mobile browsers when installing another app is unnecessary.</p></div>
                <div className="rounded-2xl border border-gold/10 p-4 bg-primary/5"><p className="font-medium text-foreground mb-2">Works with saved images</p><p>Decode QR codes from screenshots, creative assets, menu files, labels, and PDF exports.</p></div>
                <div className="rounded-2xl border border-gold/10 p-4 bg-primary/5"><p className="font-medium text-foreground mb-2">Better verification</p><p>Review the decoded text before opening unknown links, which is useful for security and quality control.</p></div>
                <div className="rounded-2xl border border-gold/10 p-4 bg-primary/5"><p className="font-medium text-foreground mb-2">Flexible workflow</p><p>Switch between live camera scanning and image upload depending on what is more practical in the moment.</p></div>
              </div>
            </div>

            <div className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10 text-sm text-muted-foreground leading-relaxed">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-3">Read the complete guide</h2>
              <p className="mb-4">For browser compatibility tips, troubleshooting advice, and safer scanning practices, explore the detailed article linked below.</p>
              <Link to="/blog/how-to-scan-qr-codes-online-without-apps" className="text-primary hover:underline font-medium">How to Scan QR Codes Online Without Apps</Link>
            </div>

            <div>
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
              <FaqAccordion items={[
                { question: "Can this scanner read a QR code from a screenshot?", answer: "Yes. Upload the screenshot as an image file (PNG, JPG, or similar) and the scanner will attempt to decode it immediately. This works well for screenshots from WhatsApp, email, presentations, and social media posts. For best results, make sure the QR code in the screenshot is clear, not blurry, and has sufficient contrast against the background." },
                { question: "Does my browser need special support for camera scanning?", answer: "You need a browser that supports camera access through the getUserMedia API and you must grant permission when prompted. Modern versions of Chrome, Firefox, Safari, and Edge all support this feature. If camera access fails, the page automatically falls back to image upload, so you can still scan codes without camera permissions." },
                { question: "What types of codes can this scanner read?", answer: "This scanner supports QR codes and 12 additional barcode formats including EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, Code 93, ITF, Codabar, Data Matrix, Aztec, and PDF417. It covers the most common formats found on product labels, shipping packages, event tickets, and business documents." },
                { question: "Why did my uploaded image fail to scan?", answer: "Common reasons include blurry or low-resolution images, poor lighting contrast between the QR code and background, partially cropped codes where finder patterns are cut off, heavy image compression artifacts, or a QR code that is damaged or printed too small. Try uploading a clearer version of the image or taking a fresh photo with better lighting and focus." },
                { question: "Is camera footage stored or uploaded anywhere?", answer: "No. The entire scanning process runs locally in your browser session. No camera frames, images, or decoded results are ever uploaded to any server. Your scans are completely private. When you close or refresh the page, all data from the scanning session is cleared." },
                { question: "Can I scan Wi-Fi QR codes to get the password?", answer: "Yes. If you scan a Wi-Fi network QR code (the kind printed on routers or shared by restaurants), the scanner will automatically extract and display the Wi-Fi password from the encoded data. You can then copy the password directly without needing to type it manually." },
              ]} />
            </div>
          </div>

          <div className="space-y-6">
            <RelatedToolsSection currentToolPath="/tools/qr-code-scanner" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default QRCodeScanner;
