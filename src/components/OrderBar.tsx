import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOrder } from "@/contexts/OrderContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function money(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 100 ? 2 : 0,
  }).format(n);
}

type Step = "info" | "review" | "submitting" | "done" | "error";

export function OrderBar() {
  const { items, totals, updateQty, removeItem, buyerInfo, setBuyerInfo, clearOrder } =
    useOrder();
  const { user } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<Step>("info");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [submittedSnapshot, setSubmittedSnapshot] = useState<{
    items: typeof items;
    total: number;
    count: number;
  } | null>(null);


  if (totals.itemCount === 0) return null;

  const openSubmit = () => {
    setStep("info");
    setErrorMsg("");
    setDialogOpen(true);
  };

  const requiredOk =
    buyerInfo.storeName.trim() &&
    buyerInfo.contactName.trim() &&
    buyerInfo.email.trim();

  const handleConfirmSubmit = async () => {
    setStep("submitting");
    const timestamp = new Date().toISOString();
    const payloadItems = items.map((i) => ({
      brand: i.brand,
      productName: i.productName,
      quantity: i.quantity,
      yourPrice: i.yourPrice,
      msrp: i.msrp,
      lineTotal: Math.round(i.yourPrice * i.quantity * 100) / 100,
    }));
    const payload = {
      timestamp,
      status: "New" as const,
      storeName: buyerInfo.storeName,
      contactName: buyerInfo.contactName,
      email: buyerInfo.email,
      phone: buyerInfo.phone,
      notes: buyerInfo.notes,
      totalItems: totals.itemCount,
      orderTotal: Math.round(totals.grandTotal * 100) / 100,
      orderTotalMSRP: Math.round(totals.grandMsrp * 100) / 100,
      totalSavings: Math.round(totals.savings * 100) / 100,
      items: payloadItems,
    };

    try {
      const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL as string | undefined;
      if (webhookUrl) {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
      }

      if (user) {
        const { error } = await supabase.from("orders").insert({
          user_id: user.id,
          company_name: buyerInfo.storeName,
          contact_name: buyerInfo.contactName,
          email: buyerInfo.email,
          phone: buyerInfo.phone || null,
          notes: buyerInfo.notes || null,
          total_items: totals.itemCount,
          order_total: payload.orderTotal,
          order_total_msrp: payload.orderTotalMSRP,
          total_savings: payload.totalSavings,
          payload,
        });
        if (error) throw error;
      } else {
        throw new Error("You must be signed in to submit an order.");
      }

      setSubmittedSnapshot({
        items: [...items],
        total: payload.orderTotal,
        count: totals.itemCount,
      });
      clearOrder();
      setStep("done");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setErrorMsg(msg);
      setStep("error");
      toast.error("Order submission failed", { description: msg });
    }
  };

  const startNew = () => {
    setSubmittedSnapshot(null);
    setDialogOpen(false);
    setSheetOpen(false);
    setStep("info");
  };

  return (
    <>
      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur shadow-[0_-6px_24px_-12px_rgba(0,0,0,0.25)]">
        <div className="container mx-auto px-4 md:px-6 py-3 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-6">
          <div className="flex items-center gap-3 md:min-w-[200px]">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
              </div>
              <div className="font-display text-lg font-black text-primary leading-tight">
                {money(totals.grandTotal)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:min-w-[280px] justify-end">
            <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
              View Order
            </Button>
            <Button variant="hero" size="sm" onClick={openSubmit}>
              Submit Order
            </Button>
          </div>
        </div>
      </div>

      {/* Order sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[92vh] flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
            <SheetTitle className="font-display text-2xl font-black">
              Your Order
            </SheetTitle>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
              </span>
              <span className="font-display text-lg font-bold text-primary">
                {money(totals.grandTotal)}
              </span>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <ul className="space-y-3">
              {items.map((i) => {
                const lineTotal = i.yourPrice * i.quantity;
                const lineMsrp = i.msrp * i.quantity;
                return (
                  <li
                    key={i.id}
                    className="flex gap-4 rounded-xl border border-border p-3"
                  >
                    <div className="h-20 w-20 flex-none overflow-hidden rounded-lg bg-muted">
                      {i.imageUrl ? (
                        <img
                          src={i.imageUrl}
                          alt={i.productName}
                          className="h-full w-full object-contain"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {i.brand}
                      </div>
                      <div className="font-display font-bold text-primary line-clamp-2">
                        {i.productName}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQty(i.id, i.quantity - 1)}
                          disabled={i.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={i.quantity}
                          onChange={(e) =>
                            updateQty(i.id, parseInt(e.target.value || "1", 10))
                          }
                          className="h-8 w-16 text-center"
                          min={1}
                          max={i.unitsAvailable}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQty(i.id, i.quantity + 1)}
                          disabled={i.quantity >= i.unitsAvailable}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="text-xs text-muted-foreground ml-1">
                          of {i.unitsAvailable}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end justify-between">
                      <div>
                        <div className="font-display font-black text-primary">
                          {money(lineTotal)}
                        </div>
                        <div className="text-xs text-muted-foreground line-through">
                          {money(lineMsrp)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(i.id)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="border-t border-border px-6 py-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{money(totals.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total MSRP</span>
              <span className="line-through text-muted-foreground">
                {money(totals.grandMsrp)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Savings</span>
              <span className="font-semibold text-mission">
                {money(totals.savings)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Items</span>
              <span className="font-semibold">{totals.itemCount}</span>
            </div>
            <Button
              variant="hero"
              size="lg"
              className="w-full mt-2"
              onClick={() => {
                setSheetOpen(false);
                openSubmit();
              }}
            >
              Submit Order
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Submit dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          if (step === "submitting") return;
          setDialogOpen(o);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {step === "info" && (
            <>
              <DialogHeader>
                <DialogTitle>Your Information</DialogTitle>
                <DialogDescription>
                  Tell us where to send the confirmation.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="storeName">
                    Store Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="storeName"
                    value={buyerInfo.storeName}
                    onChange={(e) =>
                      setBuyerInfo({ ...buyerInfo, storeName: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactName">
                    Contact Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactName"
                    value={buyerInfo.contactName}
                    onChange={(e) =>
                      setBuyerInfo({ ...buyerInfo, contactName: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={buyerInfo.email}
                    onChange={(e) =>
                      setBuyerInfo({ ...buyerInfo, email: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={buyerInfo.phone}
                    onChange={(e) =>
                      setBuyerInfo({ ...buyerInfo, phone: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes / Special Instructions</Label>
                  <Textarea
                    id="notes"
                    value={buyerInfo.notes}
                    onChange={(e) =>
                      setBuyerInfo({ ...buyerInfo, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="hero"
                  disabled={!requiredOk}
                  onClick={() => setStep("review")}
                >
                  Review Order →
                </Button>
              </div>
            </>
          )}

          {step === "review" && (
            <>
              <DialogHeader>
                <DialogTitle>Review Your Order</DialogTitle>
                <DialogDescription>
                  Confirm everything looks right before submitting.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold">Your Information</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep("info")}
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                  </div>
                  <dl className="mt-2 text-sm grid grid-cols-[120px_1fr] gap-y-1">
                    <dt className="text-muted-foreground">Store</dt>
                    <dd>{buyerInfo.storeName}</dd>
                    <dt className="text-muted-foreground">Contact</dt>
                    <dd>{buyerInfo.contactName}</dd>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd>{buyerInfo.email}</dd>
                    {buyerInfo.phone && (
                      <>
                        <dt className="text-muted-foreground">Phone</dt>
                        <dd>{buyerInfo.phone}</dd>
                      </>
                    )}
                    {buyerInfo.notes && (
                      <>
                        <dt className="text-muted-foreground">Notes</dt>
                        <dd className="whitespace-pre-wrap">{buyerInfo.notes}</dd>
                      </>
                    )}
                  </dl>
                </div>

                <div className="rounded-lg border border-border">
                  <ul className="divide-y divide-border">
                    {items.map((i) => (
                      <li key={i.id} className="p-3 flex justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {i.brand}
                          </div>
                          <div className="font-medium truncate">{i.productName}</div>
                          <div className="text-xs text-muted-foreground">
                            Qty {i.quantity} × {money(i.yourPrice)}
                          </div>
                        </div>
                        <div className="font-display font-black text-primary">
                          {money(i.yourPrice * i.quantity)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg bg-primary text-primary-foreground p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider opacity-80">
                      Order Total
                    </div>
                    <div className="font-display text-2xl font-black">
                      {money(totals.grandTotal)}
                    </div>
                  </div>
                  <div className="text-right text-sm opacity-90">
                    <div>{totals.itemCount} items</div>
                    <div>Saving {money(totals.savings)}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep("info")}>
                  ← Back
                </Button>
                <Button variant="hero" onClick={handleConfirmSubmit}>
                  Confirm & Submit →
                </Button>
              </div>
            </>
          )}

          {step === "submitting" && (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-display text-lg font-bold">
                Submitting your order…
              </p>
            </div>
          )}

          {step === "done" && submittedSnapshot && (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-mission/15 text-mission">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center">Order Submitted!</DialogTitle>
                <DialogDescription className="text-center">
                  Thanks — we'll confirm availability and freight within one
                  business day.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-lg border border-border p-4 text-left">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-semibold">{submittedSnapshot.count}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-muted-foreground">Order total</span>
                  <span className="font-display font-black text-primary">
                    {money(submittedSnapshot.total)}
                  </span>
                </div>
                <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                  {submittedSnapshot.items.map((i) => (
                    <li
                      key={i.id}
                      className="flex justify-between gap-2 border-t border-border pt-1"
                    >
                      <span className="truncate">
                        <span className="text-muted-foreground">{i.brand}</span>{" "}
                        {i.productName} × {i.quantity}
                      </span>
                      <span>{money(i.yourPrice * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={startNew}>
                  Start a New Order
                </Button>
                <Button variant="hero" asChild onClick={() => setDialogOpen(false)}>
                  <Link to="/catalog">Browse More Products</Link>
                </Button>
              </div>
            </div>
          )}

          {step === "error" && (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-destructive/15 text-destructive">
                <AlertCircle className="h-8 w-8" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center">
                  Something went wrong
                </DialogTitle>
                <DialogDescription className="text-center">
                  {errorMsg || "We couldn't submit your order."}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center gap-2">
                <Button variant="outline" asChild>
                  <a href="mailto:hello@comebackgoods.com">Contact Us</a>
                </Button>
                <Button variant="hero" onClick={() => setStep("review")}>
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
