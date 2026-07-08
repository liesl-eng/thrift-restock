import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  checkPricingUnlocked,
  unlockPricing,
  lockPricing,
} from "@/lib/gate.functions";

type PricingGateValue = {
  unlocked: boolean;
  loading: boolean;
  unlock: (code: string) => Promise<boolean>;
  lock: () => Promise<void>;
  promptOpen: boolean;
  openPrompt: () => void;
  closePrompt: () => void;
};

const PricingGateContext = createContext<PricingGateValue | undefined>(
  undefined,
);

export function PricingGateProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [promptOpen, setPromptOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    checkPricingUnlocked()
      .then((r) => {
        if (!cancelled) setUnlocked(r.unlocked);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const unlock = useCallback(async (code: string) => {
    const res = await unlockPricing({ data: { code } });
    if (res.ok) setUnlocked(true);
    return res.ok;
  }, []);

  const lock = useCallback(async () => {
    await lockPricing();
    setUnlocked(false);
  }, []);

  const openPrompt = useCallback(() => setPromptOpen(true), []);
  const closePrompt = useCallback(() => setPromptOpen(false), []);

  return (
    <PricingGateContext.Provider
      value={{
        unlocked,
        loading,
        unlock,
        lock,
        promptOpen,
        openPrompt,
        closePrompt,
      }}
    >
      {children}
    </PricingGateContext.Provider>
  );
}

export function usePricingGate() {
  const ctx = useContext(PricingGateContext);
  if (!ctx)
    throw new Error("usePricingGate must be used within PricingGateProvider");
  return ctx;
}
