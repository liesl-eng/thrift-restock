import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Comeback Restock" },
      { name: "description", content: "Common questions from nonprofit thrift retailers about pallet sourcing, pricing, freight, and diversion reporting." },
      { property: "og:title", content: "FAQ — Comeback Restock" },
      { property: "og:description", content: "Common questions from nonprofit thrift retailers." },
    ],
  }),
  component: FaqPage,
});

const FAQS = [
  {
    q: "Do we have to be a Goodwill location specifically?",
    a: "No. Our nonprofit pricing applies to any 501(c)(3) thrift operation — Goodwill member organizations, Salvation Army stores, hospital auxiliaries, faith-based thrifts, community reuse centers, and similar.",
  },
  {
    q: "Where does the inventory come from?",
    a: "Customer returns and store overstock from national home, lifestyle, and lighting retailers. We inspect, photograph, and grade every SKU before it enters the catalog.",
  },
  {
    q: "What does 'pick-by-SKU' really mean?",
    a: "Unlike mystery pallets or by-the-pound liquidation, every pallet you order is a single SKU at a known condition grade and unit count. No surprises on your dock.",
  },
  {
    q: "What's the smallest order you'll ship?",
    a: "One pallet. We have no minimum order value and no annual commitment.",
  },
  {
    q: "How is pricing structured?",
    a: "Nonprofit thrift retailers always get our lowest tier — typically $0.04 to $0.20 on the retail dollar, depending on condition and category. Your quote locks pricing for 14 days.",
  },
  {
    q: "How does freight work?",
    a: "We coordinate LTL or full truckload directly to your DC or store. For partners doing a standing weekly drop, freight is often blended into the per-pallet price.",
  },
  {
    q: "What's in the diversion report?",
    a: "Total weight diverted from landfill, units shipped, category breakdown, and an estimate of CO₂e avoided. We make it board-ready so you can use it in fundraising and impact reporting.",
  },
  {
    q: "Can we run a pilot before committing to a regular cadence?",
    a: "Yes — most regional partnerships start with a 2-3 pallet pilot across one or two stores so your team can see how the inventory moves on your floor.",
  },
];

function FaqPage() {
  return (
    <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-mission">FAQ</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl font-black text-primary leading-[0.95]">
          The questions thrift teams actually ask us.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          If yours isn't here,{" "}
          <a href="mailto:nonprofits@comebackgoods.com" className="underline underline-offset-4 hover:text-primary">
            email the partnerships team
          </a>
          .
        </p>

        <Accordion type="single" collapsible className="mt-10">
          {FAQS.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left font-display text-lg font-bold text-primary hover:no-underline py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
