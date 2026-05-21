import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, IndianRupee } from "lucide-react";
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

type EmiResult = {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  months: number;
  yearlyRate: number;
  schedulePreview: Array<{ month: number; principal: number; interest: number; balance: number }>;
};

const formatCurrency = (value: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(value));

const calculateEmiResult = (principal: number, annualRate: number, months: number): EmiResult => {
  const monthlyRate = annualRate / 12 / 100;
  const emi = monthlyRate === 0
    ? principal / months
    : (principal * monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1);

  let balance = principal;
  const schedulePreview: EmiResult["schedulePreview"] = [];

  for (let month = 1; month <= Math.min(months, 12); month += 1) {
    const interest = monthlyRate === 0 ? 0 : balance * monthlyRate;
    const principalPaid = emi - interest;
    balance = Math.max(0, balance - principalPaid);
    schedulePreview.push({ month, principal: principalPaid, interest, balance });
  }

  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;

  return { emi, totalPayment, totalInterest, months, yearlyRate: annualRate, schedulePreview };
};

const EmiCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("500000");
  const [interestRate, setInterestRate] = useState("9.5");
  const [tenure, setTenure] = useState("5");
  const [tenureUnit, setTenureUnit] = useState<"years" | "months">("years");
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    if (!submitted) return null;

    const principal = Number(loanAmount);
    const annualRate = Number(interestRate);
    const tenureValue = Number(tenure);
    const months = tenureUnit === "years" ? tenureValue * 12 : tenureValue;

    if (!principal || principal <= 0 || !months || months <= 0 || annualRate < 0) {
      return null;
    }

    return calculateEmiResult(principal, annualRate, months);
  }, [interestRate, loanAmount, submitted, tenure, tenureUnit]);

  const handleCalculate = () => {
    const principal = Number(loanAmount);
    const annualRate = Number(interestRate);
    const tenureValue = Number(tenure);
    const months = tenureUnit === "years" ? tenureValue * 12 : tenureValue;

    if (!principal || principal <= 0 || !months || months <= 0 || annualRate < 0) {
      toast({ title: "Check your inputs", description: "Enter a valid loan amount, interest rate, and tenure before calculating EMI.", variant: "destructive" });
      return;
    }

    setSubmitted(true);
    toast({ title: "EMI calculated", description: "Your monthly EMI and repayment summary are ready below." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebApplication", name: "EMI Calculator", url: "https://www.wishspark.xyz/tools/emi-calculator", description: "Calculate loan EMI online with monthly payment, total interest, and total repayment details. Ideal for home loans, car loans, and personal loans.", applicationCategory: "FinanceApplication", operatingSystem: "All", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, publisher: { "@type": "Organization", name: "WishSpark" } }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [
        { "@type": "Question", name: "What is EMI?", acceptedAnswer: { "@type": "Answer", text: "EMI stands for Equated Monthly Instalment. It is the fixed monthly amount paid toward loan repayment over the chosen tenure." } },
        { "@type": "Question", name: "How is EMI calculated?", acceptedAnswer: { "@type": "Answer", text: "EMI is calculated using the principal amount, monthly interest rate, and total number of monthly instalments through the standard reducing-balance formula." } },
        { "@type": "Question", name: "Can I use this for home, car, or personal loans?", acceptedAnswer: { "@type": "Answer", text: "Yes. The calculator works for most fixed-rate loan estimates including home loans, personal loans, business loans, and car loans." } },
        { "@type": "Question", name: "Does this show total interest too?", acceptedAnswer: { "@type": "Answer", text: "Yes. Along with monthly EMI, the tool also shows total interest payable and total repayment over the tenure." } },
        { "@type": "Question", name: "What if my interest rate is zero?", acceptedAnswer: { "@type": "Answer", text: "If the interest rate is zero, the EMI is simply the principal divided equally across the total number of months." } }
      ] }} />

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <SeoBreadcrumbs
          items={[
            { label: "Tools", href: "/#fun-tools" },
            { label: "EMI Calculator" },
          ]}
        />
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <motion.div className="text-6xl mb-4" animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 2.2 }}>💳</motion.div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gold-gradient mb-4">EMI Calculator</h1>
          <p className="text-muted-foreground text-base md:text-lg">Estimate your monthly loan EMI, total repayment, and interest outgo for home loans, car finance, education loans, and personal borrowing.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.95fr] gap-6 mb-10">
          <section className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/20 shadow-gold">
            <div className="flex items-center gap-2 mb-4 text-foreground">
              <Calculator className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-semibold">Calculate your EMI</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Loan amount</label>
                <Input value={loanAmount} onChange={(event) => setLoanAmount(event.target.value)} inputMode="decimal" className="bg-secondary/50 border-gold/20" placeholder="500000" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Annual interest rate (%)</label>
                <Input value={interestRate} onChange={(event) => setInterestRate(event.target.value)} inputMode="decimal" className="bg-secondary/50 border-gold/20" placeholder="9.5" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Tenure</label>
                <Input value={tenure} onChange={(event) => setTenure(event.target.value)} inputMode="decimal" className="bg-secondary/50 border-gold/20" placeholder="5" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Tenure unit</label>
                <select value={tenureUnit} onChange={(event) => setTenureUnit(event.target.value as "years" | "months")} className="flex h-10 w-full rounded-md border border-gold/20 bg-secondary/50 px-3 py-2 text-sm text-foreground outline-none">
                  <option value="years">Years</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>
            <Button onClick={handleCalculate} className="mt-5 bg-gold-gradient text-primary-foreground hover:opacity-90">
              <IndianRupee className="w-4 h-4 mr-2" />
              Calculate EMI
            </Button>
          </section>

          <aside className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">Repayment summary</h2>
            {result ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-gold/10 bg-primary/5 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Monthly EMI</p>
                  <p className="text-3xl font-bold text-primary">₹ {formatCurrency(result.emi)}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-gold/10 p-4 bg-primary/5"><p className="text-xs text-muted-foreground mb-1">Total interest</p><p className="font-semibold text-foreground">₹ {formatCurrency(result.totalInterest)}</p></div>
                  <div className="rounded-2xl border border-gold/10 p-4 bg-primary/5"><p className="text-xs text-muted-foreground mb-1">Total repayment</p><p className="font-semibold text-foreground">₹ {formatCurrency(result.totalPayment)}</p></div>
                </div>
                <p className="text-xs text-muted-foreground">Calculation based on {result.months} monthly instalments at {result.yearlyRate}% annual interest.</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">Enter your loan amount, interest rate, and repayment tenure to estimate EMI and total borrowing cost.</p>
            )}
          </aside>
        </div>

        {result && (
          <section className="mb-10 bg-glass rounded-3xl p-6 md:p-8 border border-gold/10 overflow-x-auto">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-4">First-year repayment preview</h2>
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead>
                <tr className="border-b border-gold/10 text-foreground">
                  <th className="py-2 pr-4">Month</th>
                  <th className="py-2 pr-4">Principal</th>
                  <th className="py-2 pr-4">Interest</th>
                  <th className="py-2">Remaining Balance</th>
                </tr>
              </thead>
              <tbody>
                {result.schedulePreview.map((row) => (
                  <tr key={row.month} className="border-b border-gold/5 last:border-0">
                    <td className="py-2 pr-4">{row.month}</td>
                    <td className="py-2 pr-4">₹ {formatCurrency(row.principal)}</td>
                    <td className="py-2 pr-4">₹ {formatCurrency(row.interest)}</td>
                    <td className="py-2">₹ {formatCurrency(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <section className="mb-10 bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
          <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Introduction</h2>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              An EMI calculator is one of the most useful finance tools on the web because borrowing decisions become clearer when repayment is translated into a monthly number. A loan amount may look manageable at first glance, but affordability depends on the combination of principal, interest rate, and tenure. Whether someone is comparing home loan offers, planning a car purchase, evaluating a personal loan, or estimating education financing, the monthly EMI is usually the figure that determines whether the commitment fits the household budget.
            </p>
            <p>
              The reason people rely on EMI calculators is that manual repayment estimation is inconvenient and easy to get wrong. Even if you understand the basics of reducing-balance interest, repeating the formula across different loan sizes, rates, and repayment periods is slow. A reliable tool helps you test scenarios quickly. You can change the tenure, adjust the interest rate, and see how those decisions affect both the monthly burden and the total interest paid over time.
            </p>
            <p>
              This page is designed for practical decision-making, not just formula display. In addition to the EMI, it shows total repayment and total interest so you can understand the real cost of the loan. That broader view matters. Many borrowers focus only on the monthly instalment and overlook how a longer tenure can significantly increase the cumulative interest outgo. A good calculator should therefore help users balance affordability and efficiency, which is exactly what this tool is built to support.
            </p>
          </div>
        </section>

        <AdBanner adSlot="TOOL_MID" adFormat="horizontal" className="mb-10" />

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <div className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Detailed Explanation: Why EMI Calculation Matters Before You Borrow</h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  EMI stands for Equated Monthly Instalment, which is the fixed monthly payment a borrower makes toward a loan over the chosen term. That payment includes two parts: interest and principal. Early in the repayment cycle, the interest component is larger because the outstanding balance is high. Over time, as the balance falls, the principal portion becomes larger. This reducing-balance structure is common across many loans, which is why the standard EMI formula is widely used for home finance, personal loans, auto loans, and similar products.
                </p>
                <p>
                  Understanding EMI matters because borrowing is not only about loan approval. It is about sustainable repayment. A loan that looks attractive because of a lower EMI may in fact carry a much higher overall cost if the tenure is too long. On the other hand, a shorter tenure can reduce interest significantly but may create monthly stress if the instalment is too high. Good financial planning means finding a balance between monthly affordability and long-term efficiency rather than choosing only the lowest visible monthly payment.
                </p>
                <p>
                  This is why scenario testing is so valuable. A borrower may compare a five-year and seven-year loan term for the same principal and interest rate, then immediately see how the EMI and total interest change. That kind of comparison helps before applying, before negotiating with lenders, and before committing to a repayment schedule. It is especially helpful for salaried households and business owners who need to align monthly obligations with cash flow.
                </p>
                <p>
                  The finance benefit extends beyond personal budgeting. Real estate advisors, car dealerships, loan agents, and finance content publishers often use EMI examples to explain affordability to prospects. Students and families planning education loans also use calculators to understand how repayment burdens may look after the grace period ends. In each case, a calculator turns abstract borrowing terms into understandable monthly outcomes.
                </p>
                <p>
                  The output should not be treated as a final bank sanction number because actual lending products may include processing fees, insurance, prepayment conditions, floating-rate changes, or irregular charges. Still, a good EMI calculator gives a dependable estimate for planning. It helps users ask better questions when speaking with lenders and makes it easier to compare multiple offers on a like-for-like basis.
                </p>
                <p>
                  That is why a production-ready EMI tool should do more than calculate one number. It should also show total interest, total repayment, and at least a preview of how the repayment mix changes in early months. These details help users understand not only what they will pay each month, but what they are truly committing to across the full borrowing period.
                </p>
              </div>
            </div>

            <div className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">How to Use the EMI Calculator</h2>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span><span>Enter the total loan amount you plan to borrow, such as the approved principal for a home, car, personal, or education loan.</span></li>
                <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span><span>Type the annual interest rate offered by the lender. If you are comparing lenders, test each rate separately to see the difference clearly.</span></li>
                <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">3</span><span>Enter the tenure and choose whether it is in years or months. The calculator will convert it into the required monthly instalment count.</span></li>
                <li className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">4</span><span>Click <strong className="text-foreground">Calculate EMI</strong> to view the monthly EMI, total interest payable, total repayment, and a preview of early repayment breakdown.</span></li>
              </ol>
            </div>

            <div className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Benefits of Using an EMI Tool Before Loan Approval</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-gold/10 p-4 bg-primary/5"><p className="font-medium text-foreground mb-2">Budget clarity</p><p>See whether the monthly instalment fits your cash flow before you commit to a lender or loan size.</p></div>
                <div className="rounded-2xl border border-gold/10 p-4 bg-primary/5"><p className="font-medium text-foreground mb-2">Offer comparison</p><p>Test different rates and tenures quickly to compare loan products on a more practical basis.</p></div>
                <div className="rounded-2xl border border-gold/10 p-4 bg-primary/5"><p className="font-medium text-foreground mb-2">Interest awareness</p><p>Understand the total finance cost instead of focusing only on the monthly EMI headline.</p></div>
                <div className="rounded-2xl border border-gold/10 p-4 bg-primary/5"><p className="font-medium text-foreground mb-2">Decision confidence</p><p>Make more informed borrowing choices with a clearer understanding of repayment structure and trade-offs.</p></div>
              </div>
            </div>

            <div className="bg-glass rounded-3xl p-6 md:p-8 border border-gold/10 text-sm text-muted-foreground leading-relaxed">
              <h2 className="text-2xl font-display font-semibold text-foreground mb-3">Read the complete guide</h2>
              <p className="mb-4">For a deeper explanation of the formula, lender comparison tips, and ways to reduce interest burden, use the linked article below.</p>
              <Link to="/blog/how-to-calculate-emi-easily-full-guide" className="text-primary hover:underline font-medium">How to Calculate EMI Easily (Full Guide)</Link>
            </div>

            <div>
              <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
              <FaqAccordion items={[
                { question: "Can I use this EMI calculator for home and car loans?", answer: "Yes. The EMI logic applies to most standard fixed-rate reducing-balance loans including home, auto, education, and personal borrowing estimates." },
                { question: "Why does a longer tenure reduce EMI but increase total interest?", answer: "Spreading repayment over more months lowers the monthly payment, but it also means interest accrues over a longer period, increasing the total cost." },
                { question: "Does this calculator include processing fees?", answer: "No. It estimates EMI from principal, interest rate, and tenure only. Fees, insurance, and lender-specific charges should be considered separately." },
                { question: "What if my rate changes during the loan term?", answer: "If you have a floating-rate loan, the actual EMI or tenure may change later. Use updated rate inputs to estimate revised outcomes." },
                { question: "Is the repayment preview an amortization schedule?", answer: "It is a simplified first-year preview showing how interest and principal split across early instalments on a reducing balance." },
              ]} />
            </div>
          </div>

          <div className="space-y-6">
            <RelatedToolsSection currentToolPath="/tools/emi-calculator" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default EmiCalculator;
