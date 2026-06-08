import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuote } from "@/lib/quote-context";
import { CATALOG, formatMoney } from "@/lib/catalog";
import { Mail, Phone, MapPin, Minus, Plus, X, ShoppingBag, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Quote — Comeback Goods × Goodwill" },
      { name: "description", content: "Review your pallet quote and send it to the Comeback Goods partnerships team. We respond within one business day." },
      { property: "og:title", content: "Contact — Comeback Goods × Goodwill" },
      { property: "og:description", content: "Send your quote. We respond within one business day." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { items, setQty, remove, totalUnits, totalPrice, totalRetail, clear } = useQuote();
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  const savings = totalRetail - totalPrice;

  return (
    <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
      <div className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-widest text-mission">Contact</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl font-black text-primary leading-[0.95]">
          Let's get the right pallets on your <span className="marker-highlight marker-highlight-gold">truck</span>.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Review your quote, tell us about your store, and our partnerships
          team will confirm availability within one business day.
        </p>
      </div>

      <div className="mt-12 grid lg:grid-cols-5 gap-10">
        {/* Quote summary */}
        <aside className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-primary flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" /> Your quote
              </h2>
              {items.length > 0 && (
                <button
                  onClick={clear}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Clear
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-border bg-background p-6 text-center">
                <p className="text-sm text-muted-foreground">Your quote is empty.</p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link to="/catalog">Browse the catalog</Link>
                </Button>
              </div>
            ) : (
              <>
                <ul className="mt-5 space-y-4 max-h-[420px] overflow-y-auto pr-1">
                  {items.map((item) => {
                    const sku = CATALOG.find((s) => s.id === item.skuId);
                    if (!sku) return null;
                    const lineUnits = sku.unitsPerPallet * item.pallets;
                    const linePrice = lineUnits * sku.pricePerUnit;
                    return (
                      <li key={sku.id} className="flex gap-3">
                        <img
                          src={sku.image}
                          alt={sku.name}
                          loading="lazy"
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-md object-cover border border-border"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-primary text-sm truncate">{sku.name}</p>
                              <p className="font-mono text-[11px] text-muted-foreground">{sku.id}</p>
                            </div>
                            <button
                              onClick={() => remove(sku.id)}
                              className="text-muted-foreground hover:text-destructive"
                              aria-label="Remove"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setQty(sku.id, item.pallets - 1)}
                                className="grid h-7 w-7 place-items-center rounded-md border border-border hover:bg-secondary"
                                aria-label="Decrease"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-10 text-center text-sm font-semibold">
                                {item.pallets} <span className="text-muted-foreground font-normal">pl</span>
                              </span>
                              <button
                                onClick={() => setQty(sku.id, item.pallets + 1)}
                                className="grid h-7 w-7 place-items-center rounded-md border border-border hover:bg-secondary"
                                aria-label="Increase"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-primary">
                              {formatMoney(linePrice)}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-6 border-t border-border pt-4 space-y-2 text-sm">
                  <Row label="Total units" value={totalUnits.toLocaleString()} />
                  <Row label="Retail value" value={formatMoney(totalRetail)} muted strike />
                  <Row label="You save" value={formatMoney(savings)} accent="mission" />
                  <div className="flex items-baseline justify-between pt-3 border-t border-border">
                    <span className="font-display font-bold text-primary">Quote total</span>
                    <span className="font-display text-2xl font-black text-primary">
                      {formatMoney(totalPrice)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Form / contact */}
        <div className="lg:col-span-3">
          {sent ? (
            <div className="rounded-2xl border border-mission/40 bg-mission/10 p-8">
              <CheckCircle2 className="h-10 w-10 text-mission" />
              <h2 className="mt-4 font-display text-3xl font-black text-primary">
                Got it — talk soon.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Your quote is in our queue. Our partnerships team confirms
                availability and freight within one business day. In a hurry?
                Reach us directly at{" "}
                <a href="mailto:nonprofits@comebackgoods.com" className="font-semibold text-primary underline underline-offset-4">
                  nonprofits@comebackgoods.com
                </a>
                .
              </p>
              <div className="mt-6">
                <Button asChild variant="outline">
                  <Link to="/catalog">Back to the catalog</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="rounded-2xl border border-border bg-card p-6 md:p-8"
            >
              <h2 className="font-display text-2xl font-bold text-primary">
                Tell us about your store
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll respond within one business day.
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Your name" name="name" required />
                <Field label="Organization" name="org" required placeholder="Goodwill of ___ / org name" />
                <Field label="Email" name="email" type="email" required />
                <Field label="Phone" name="phone" type="tel" />
                <Field label="City & state" name="location" />
                <Field label="Number of store locations" name="locations" type="number" min={1} defaultValue={1} />
              </div>

              <div className="mt-5">
                <Label htmlFor="notes" className="text-sm font-semibold text-primary">
                  Anything else we should know?
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  placeholder="Cadence you're hoping for, categories you're prioritizing, delivery constraints…"
                  className="mt-2"
                />
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button type="submit" variant="hero" size="lg" className="min-w-48">
                  Send quote request
                </Button>
                <p className="text-xs text-muted-foreground">
                  No spam. We use this to staff your account.
                </p>
              </div>
            </form>
          )}

          {/* Direct contact */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <ContactCard icon={Mail} label="Email" value="nonprofits@comebackgoods.com" href="mailto:nonprofits@comebackgoods.com" />
            <ContactCard icon={Phone} label="Phone" value="(415) 555-0140" href="tel:+14155550140" />
            <ContactCard icon={MapPin} label="Warehouse" value="Oakland, CA + Atlanta, GA" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  strike,
  accent,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strike?: boolean;
  accent?: "mission";
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={muted ? "text-muted-foreground" : "text-foreground"}>{label}</span>
      <span
        className={
          accent === "mission"
            ? "font-semibold text-mission"
            : strike
              ? "text-muted-foreground line-through"
              : "font-semibold text-primary"
        }
      >
        {value}
      </span>
    </div>
  );
}

function Field({
  label,
  name,
  ...rest
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label htmlFor={name} className="text-sm font-semibold text-primary">
        {label}
      </Label>
      <Input id={name} name={name} className="mt-2" {...rest} />
    </div>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
      <Icon className="h-5 w-5 text-mission" />
      <div className="mt-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-primary">{value}</div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}
