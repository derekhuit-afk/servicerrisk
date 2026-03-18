import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const SAMPLE_DATA = [{"servicer_name":"Mr. Cooper","nmls_id":"2119","total_upb":320000000000,"delinquency_60plus":2.84,"foreclosure_rate":0.42,"cfpb_complaints_per_1k":4.8,"complaint_resolution_rate":0.91,"transfer_velocity_12mo":0.08,"risk_score":62,"risk_band":"MEDIUM"},{"servicer_name":"PHH Mortgage","nmls_id":"75243","total_upb":48000000000,"delinquency_60plus":4.12,"foreclosure_rate":0.81,"cfpb_complaints_per_1k":8.4,"complaint_resolution_rate":0.78,"transfer_velocity_12mo":0.21,"risk_score":84,"risk_band":"HIGH"},{"servicer_name":"Planet Home Lending","nmls_id":"217832","total_upb":12000000000,"delinquency_60plus":1.92,"foreclosure_rate":0.28,"cfpb_complaints_per_1k":2.1,"complaint_resolution_rate":0.96,"transfer_velocity_12mo":0.04,"risk_score":38,"risk_band":"LOW"}];

function getStats(data: Record<string, unknown>[]) {
  if (!data || data.length === 0) return {};
  const numericKeys = Object.keys(data[0]).filter(k => typeof data[0][k] === "number");
  const stats: Record<string, unknown> = { total_records: data.length };
  numericKeys.slice(0, 2).forEach(k => {
    const avg = data.reduce((s, r) => s + (Number(r[k]) || 0), 0) / data.length;
    stats[`avg_${k}`] = Math.round(avg * 100) / 100;
  });
  return stats;
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  
  let data = SAMPLE_DATA as Record<string, unknown>[];
  if (q) {
    data = data.filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(q.toLowerCase()))
    );
  }
  
  return NextResponse.json({
    data,
    stats: getStats(data),
    refreshed: new Date().toISOString()
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const data = SAMPLE_DATA as Record<string, unknown>[];
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  const csv = [
    headers.join(","),
    ...data.map(r => headers.map(h => String(r[h] ?? "")).join(","))
  ].join("\n");
  
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=servicerrisk-export.csv`
    }
  });
}
