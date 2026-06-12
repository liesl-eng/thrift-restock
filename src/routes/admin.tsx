import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  verifyAdmin,
  getAdminStatus,
  getStagedBrand,
  runImportSync,
  approveBrand,
  discardStaged,
} from "@/lib/catalog.functions";

import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Check,
  X,
  Eye,
  AlertCircle,
  Loader2,
  LogOut,
} from "lucide-react";

const PW_KEY = "cbg_admin_pw";

function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 100 ? 2 : 0,
  }).format(n);
}

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Product import review" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [pw, setPw] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(PW_KEY);
    if (saved) setPw(saved);
  }, []);

  if (!pw) return <LoginGate onAuth={(p) => setPw(p)} />;
  return (
    <Dashboard
      password={pw}
      onLogout={() => {
        sessionStorage.removeItem(PW_KEY);
        setPw(null);
      }}
    />
  );
}

function LoginGate({ onAuth }: { onAuth: (pw: string) => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const verify = useServerFn(verifyAdmin);
  const mut = useMutation({
    mutationFn: (p: string) => verify({ data: { password: p } }),
    onSuccess: (r, vars) => {
      if (r.ok) {
        sessionStorage.setItem(PW_KEY, vars);
        onAuth(vars);
      } else setError("Incorrect password");
    },
    onError: (e: any) => setError(e?.message ?? "Failed"),
  });

  return (
    <div className="container mx-auto max-w-sm px-4 py-24">
      <h1 className="font-display text-3xl font-black uppercase tracking-tight">
        Admin
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter the admin password to review imports.
      </p>
      <form
        className="mt-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          mut.mutate(input);
        }}
      >
        <input
          type="password"
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Password"
        />
        {error && (
          <p className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        )}
        <Button type="submit" disabled={mut.isPending} className="w-full">
          {mut.isPending ? "Checking…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}

function Dashboard({
  password,
  onLogout,
}: {
  password: string;
  onLogout: () => void;
}) {
  const qc = useQueryClient();
  const status = useServerFn(getAdminStatus);
  const sync = useServerFn(runImportSync);

  const statusQ = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => status({ data: { password } }),
    refetchOnWindowFocus: false,
  });

  const syncMut = useMutation({
    mutationFn: () => sync({ data: { password } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-status"] });
    },
  });

  const [previewBrand, setPreviewBrand] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight">
            Product import review
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Daily sync stages each brand here. Approve to replace live products
            for that brand. The public catalog stays live until you approve.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => statusQ.refetch()}
            disabled={statusQ.isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${statusQ.isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => syncMut.mutate()}
            disabled={syncMut.isPending}
          >
            {syncMut.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Syncing…
              </>
            ) : (
              <>Run sync now</>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>

      {syncMut.error && (
        <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {(syncMut.error as Error).message}
        </div>
      )}

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold">Brands</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Brand</th>
                <th className="px-4 py-3 font-semibold">Live</th>
                <th className="px-4 py-3 font-semibold">Staged</th>
                <th className="px-4 py-3 font-semibold">Changes</th>
                <th className="px-4 py-3 font-semibold">Last approved</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {statusQ.data?.brands.map((b) => (
                <tr key={b.brand} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{b.brand}</td>
                  <td className="px-4 py-3">{b.liveCount}</td>
                  <td className="px-4 py-3">
                    {b.stagedCount ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {b.hasStaged ? (
                      <span className="flex gap-3 text-xs">
                        <span className="text-emerald-600">+{b.added}</span>
                        <span className="text-coral">−{b.removed}</span>
                        <span className="text-amber-600">~{b.changed}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Up to date</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {b.liveApprovedAt
                      ? new Date(b.liveApprovedAt).toLocaleString()
                      : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={!b.hasStaged}
                        onClick={() => setPreviewBrand(b.brand)}
                      >
                        <Eye className="h-4 w-4" /> Preview
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!statusQ.data && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    Loading…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Recent sync runs</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Started</th>
                <th className="px-4 py-3 font-semibold">Brand</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {(statusQ.data?.runs ?? []).map((r: any) => {
                const statusClass =
                  r.status === "approved" || r.status === "auto_approved"
                    ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                    : r.status === "failed"
                      ? "rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
                      : r.status === "discarded"
                        ? "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                        : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800";
                return (
                  <tr key={r.id} className="border-t border-border align-top">
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(r.started_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium">{r.brand}</td>
                    <td className="px-4 py-3">
                      <span className={statusClass}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {r.error_message ? (
                        <span className="text-destructive">{r.error_message}</span>
                      ) : (
                        <span>
                          {r.fetched_count ?? 0} items
                          <span className="text-emerald-600"> +{r.new_count ?? 0}</span>
                          <span className="text-coral"> −{r.removed_count ?? 0}</span>
                          <span className="text-amber-600"> ~{r.changed_count ?? 0}</span>
                          {r.status === "auto_approved" && (
                            <span className="ml-1 italic">(auto-approved)</span>
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {(statusQ.data?.runs ?? []).length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No import runs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {previewBrand && (
        <PreviewModal
          password={password}
          brand={previewBrand}
          onClose={() => setPreviewBrand(null)}
          onApproved={() => {
            setPreviewBrand(null);
            qc.invalidateQueries({ queryKey: ["admin-status"] });
            qc.invalidateQueries({ queryKey: ["catalog"] });
          }}
        />
      )}
    </div>
  );
}


function PreviewModal({
  password,
  brand,
  onClose,
  onApproved,
}: {
  password: string;
  brand: string;
  onClose: () => void;
  onApproved: () => void;
}) {
  const getStaged = useServerFn(getStagedBrand);
  const approve = useServerFn(approveBrand);
  const discard = useServerFn(discardStaged);

  const q = useQuery({
    queryKey: ["staged", brand],
    queryFn: () => getStaged({ data: { password, brand } }),
  });

  const approveMut = useMutation({
    mutationFn: () => approve({ data: { password, brand } }),
    onSuccess: onApproved,
  });
  const discardMut = useMutation({
    mutationFn: () => discard({ data: { password, brand } }),
    onSuccess: onApproved,
  });

  const added = q.data?.added ?? 0;
  const removed = q.data?.removed ?? 0;
  const changed = q.data?.changed ?? 0;
  const allRows = q.data?.rows ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-5xl rounded-lg bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="font-display text-xl font-bold">{brand}</h3>
            <p className="text-sm text-muted-foreground">
              {allRows.length} staged items ·{" "}
              <span className="text-emerald-600">+{added}</span>{" "}
              <span className="text-coral">−{removed}</span>{" "}
              <span className="text-amber-600">~{changed}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => discardMut.mutate()}
              disabled={discardMut.isPending || approveMut.isPending}
            >
              <X className="h-4 w-4" /> Discard
            </Button>
            <Button
              size="sm"
              onClick={() => approveMut.mutate()}
              disabled={approveMut.isPending || discardMut.isPending}
            >
              <Check className="h-4 w-4" />
              {approveMut.isPending ? "Approving…" : "Approve & replace live"}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
          {q.isLoading && (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}
          {q.data && allRows.length === 0 && (
            <p className="text-sm text-muted-foreground">No differences.</p>
          )}
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="py-2">Change</th>
                <th className="py-2">Item</th>
                <th className="py-2">Category</th>
                <th className="py-2">Price</th>
                <th className="py-2">Units</th>
              </tr>
            </thead>
            <tbody>
              {allRows.map((r, i) => (
                <tr key={i} className="border-t border-border align-top">
                  <td className="py-2 pr-3">
                    <ChangeChip kind={r.kind} />
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2">
                      {r.item.image ? (
                        <img
                          src={r.item.image}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted" />
                      )}
                      <span className="line-clamp-2">{r.item.name}</span>
                    </div>
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">
                    {r.item.category}
                  </td>
                  <td className="py-2 pr-3">
                    {formatMoney(r.item.price)}
                    {r.prev && r.prev.price !== r.item.price && (
                      <span className="ml-1 text-xs text-muted-foreground line-through">
                        {formatMoney(r.prev.price)}
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    {r.item.units}
                    {r.prev && r.prev.units !== r.item.units && (
                      <span className="ml-1 text-xs text-muted-foreground line-through">
                        {r.prev.units}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ChangeChip({ kind }: { kind: "added" | "removed" | "changed" }) {
  const map = {
    added: "bg-emerald-100 text-emerald-700",
    removed: "bg-coral/15 text-coral",
    changed: "bg-amber-100 text-amber-800",
  } as const;
  const label = { added: "New", removed: "Removed", changed: "Updated" }[kind];
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[kind]}`}
    >
      {label}
    </span>
  );
}
