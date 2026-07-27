import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LEAK_ALERTS, ZONES } from "@/lib/mock-data";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports · AquaSense AI" },
      {
        name: "description",
        content: "Generate PDF and CSV reports on leaks, maintenance and pipeline health, filtered by zone and date.",
      },
      { property: "og:title", content: "Reports · AquaSense AI" },
      { property: "og:description", content: "Downloadable reports on water network operations." },
    ],
  }),
  component: Reports,
});

function Reports() {
  const [zone, setZone] = useState("All");
  const [severity, setSeverity] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const rows = useMemo(() => {
    return LEAK_ALERTS.filter((a) => (zone === "All" ? true : a.zone === zone))
      .filter((a) => (severity === "All" ? true : a.severity === severity))
      .filter((a) => (from ? a.detectedAt >= from : true))
      .filter((a) => (to ? a.detectedAt <= to + "T23:59:59Z" : true))
      .slice(0, 40);
  }, [zone, severity, from, to]);

  const exportCSV = () => {
    const header = ["Pipeline", "Zone", "Severity", "Detected", "Loss L/min", "Location"];
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        [r.pipelineCode, r.zone, r.severity, r.detectedAt, r.estimatedLossLpm, `"${r.location}"`].join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aquasense-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const exportPDF = () => {
    // Lightweight print-to-PDF (browser dialog)
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>AquaSense Report</title>
      <style>body{font-family:Inter,system-ui;padding:32px;color:#1F2937}
      h1{color:#3B82F6}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:12px}
      th,td{border-bottom:1px solid #E5E7EB;padding:8px;text-align:left}
      th{background:#F5F9FF}</style></head><body>
      <h1>AquaSense AI · Leak Report</h1>
      <p>Filters: zone=${zone}, severity=${severity}, from=${from || "-"}, to=${to || "-"}</p>
      <table><thead><tr><th>Pipeline</th><th>Zone</th><th>Severity</th><th>Detected</th><th>Loss (L/min)</th><th>Location</th></tr></thead>
      <tbody>${rows
        .map(
          (r) =>
            `<tr><td>${r.pipelineCode}</td><td>${r.zone}</td><td>${r.severity}</td><td>${new Date(r.detectedAt).toLocaleString()}</td><td>${r.estimatedLossLpm}</td><td>${r.location}</td></tr>`,
        )
        .join("")}</tbody></table></body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  };

  return (
    <PageShell
      title="Reports"
      subtitle="Filter, preview and export operational reports."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button className="rounded-full gradient-primary text-white" onClick={exportPDF}>
            <FileText className="mr-2 h-4 w-4" /> PDF
          </Button>
        </div>
      }
    >
      <div className="neo-card-lg mb-6 p-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Field label="Zone">
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm shadow-[var(--shadow-neo-inset)]"
            >
              {["All", ...ZONES].map((z) => (
                <option key={z}>{z}</option>
              ))}
            </select>
          </Field>
          <Field label="Severity">
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-sm shadow-[var(--shadow-neo-inset)]"
            >
              {["All", "Critical", "High", "Medium", "Low"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="From">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border-none bg-secondary/60 shadow-[var(--shadow-neo-inset)]" />
          </Field>
          <Field label="To">
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border-none bg-secondary/60 shadow-[var(--shadow-neo-inset)]" />
          </Field>
        </div>
      </div>

      <div className="neo-card-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Pipeline</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Detected</th>
                <th className="px-4 py-3">Loss</th>
                <th className="px-4 py-3">Location</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="px-4 py-3 font-medium">{r.pipelineCode}</td>
                  <td className="px-4 py-3">{r.zone}</td>
                  <td className="px-4 py-3">{r.severity}</td>
                  <td className="px-4 py-3">{new Date(r.detectedAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{r.estimatedLossLpm} L/min</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
