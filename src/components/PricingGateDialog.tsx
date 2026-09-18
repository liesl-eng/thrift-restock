import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usePricingGate } from "@/contexts/PricingGateContext";
import { Lock } from "lucide-react";

export function PricingGateDialog() {
  const { promptOpen, closePrompt, unlock } = usePricingGate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [revealLast, setRevealLast] = useState(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
    };
  }, []);

  const display =
    code.length === 0
      ? ""
      : revealLast
        ? "•".repeat(code.length - 1) + code[code.length - 1]
        : "•".repeat(code.length);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.toUpperCase();
    let updated: string;
    if (next.length > code.length) {
      updated = code + next.slice(code.length);
    } else {
      updated = code.slice(0, next.length);
    }
    setCode(updated);
    if (revealTimer.current) clearTimeout(revealTimer.current);
    if (next.length > code.length) {
      setRevealLast(true);
      revealTimer.current = setTimeout(() => setRevealLast(false), 700);
    } else {
      setRevealLast(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const ok = await unlock(code);
      if (ok) {
        setCode("");
        closePrompt();
      } else {
        setError("Incorrect access code. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={promptOpen}
      onOpenChange={(o) => {
        if (!o) {
          setCode("");
          setError(null);
          closePrompt();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary mb-2">
            <Lock className="h-5 w-5" />
          </div>
          <DialogTitle className="font-display text-center">
            Enter access code to see pricing
          </DialogTitle>
          <DialogDescription className="text-center">
            Pricing is available to approved buyers. Enter your access code to
            unlock all prices. Don't have one? Contact us for access.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          <div className="grid gap-2">
            <Label htmlFor="access-code">Access code</Label>
            <Input
              id="access-code"
              autoFocus
              value={display}
              onChange={handleChange}
              inputMode="text"
              autoCapitalize="characters"
              spellCheck={false}
              className="tracking-widest"
              placeholder="Enter your code"
              autoComplete="off"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCode("");
                setError(null);
                closePrompt();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !code.trim()}>
              {submitting ? "Checking…" : "Unlock pricing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
