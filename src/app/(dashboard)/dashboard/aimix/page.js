"use client";

import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";

function Card({ title, value, detail }) {
  return <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs uppercase tracking-wide text-text-muted">{title}</p><p className="mt-2 text-2xl font-semibold text-text-main">{value}</p>{detail && <p className="mt-1 text-sm text-text-muted">{detail}</p>}</div>;
}
Card.propTypes = { title: PropTypes.string.isRequired, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, detail: PropTypes.string };

export default function AIMixControlPage() {
  const [doctor, setDoctor] = useState(null); const [traces, setTraces] = useState([]); const [assets, setAssets] = useState([]); const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [doctorResponse, traceResponse, assetResponse] = await Promise.all([fetch("/api/aimix/doctor", { cache: "no-store" }), fetch("/api/aimix/traces?limit=20", { cache: "no-store" }), fetch("/api/aimix/assets", { cache: "no-store" })]);
      setDoctor(await doctorResponse.json()); setTraces((await traceResponse.json()).data || []); setAssets((await assetResponse.json()).data || []);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = setTimeout(refresh, 0); return () => clearTimeout(timer); }, [refresh]);
  const rejected = traces.filter((trace) => !trace.selectedRoute).length;
  return <div className="space-y-6 p-6">
    <div className="flex items-start justify-between gap-4"><div><h1 className="text-2xl font-semibold text-text-main">AIMix Control Center</h1><p className="mt-1 text-text-muted">One gateway. Every model. Smart execution.</p></div><button onClick={refresh} disabled={loading} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{loading ? "Checking…" : "Refresh"}</button></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card title="Platform health" value={doctor?.healthy ? "Healthy" : "Needs attention"} detail={`${doctor?.results?.length || 0} doctor checks`} /><Card title="Decision traces" value={traces.length} detail="Most recent executions" /><Card title="Rejected plans" value={rejected} detail="Hard constraints protected" /><Card title="Versioned assets" value={assets.length} detail="Policies, workflows, evaluators" /></div>
    <div className="grid gap-6 xl:grid-cols-2"><section className="rounded-xl border border-border bg-card p-4"><h2 className="font-semibold text-text-main">Doctor</h2><div className="mt-3 space-y-2">{(doctor?.results || []).map((check) => <div key={check.name} className="flex items-center justify-between rounded-lg bg-sidebar px-3 py-2 text-sm"><span>{check.name}</span><span className={check.status === "pass" ? "text-green-500" : check.status === "warn" ? "text-yellow-500" : "text-red-500"}>{check.status}</span></div>)}</div></section>
    <section className="rounded-xl border border-border bg-card p-4"><h2 className="font-semibold text-text-main">Recent routing decisions</h2><div className="mt-3 space-y-2">{traces.length ? traces.map((trace) => <div key={trace.requestId} className="rounded-lg bg-sidebar px-3 py-2 text-sm"><div className="flex justify-between gap-3"><code className="truncate">{trace.requestId}</code><span>{trace.selectedRoute || "rejected"}</span></div><p className="mt-1 text-xs text-text-muted">{trace.decisionReason}</p></div>) : <p className="text-sm text-text-muted">No AIMix decisions recorded yet.</p>}</div></section></div>
  </div>;
}
