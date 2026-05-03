import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { fetchEntries, formatVND, formatShort, formatTime, MoneyEntry } from "../lib/api";

export default function Home() {
  const [entries, setEntries] = useState<MoneyEntry[]>([]);
  const [now, setNow] = useState("");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const all = await fetchEntries();
      setEntries([...all].reverse());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    setMounted(true);
    load();
    const iv = setInterval(load, 60_000);
    const tick = setInterval(() => setNow(new Date().toLocaleTimeString("vi-VN")), 1000);
    setNow(new Date().toLocaleTimeString("vi-VN"));
    return () => { clearInterval(iv); clearInterval(tick); };
  }, [load]);

  const latest = entries.length > 0 ? entries[0].amount : 0;
  const prev = entries.length >= 2 ? entries[1].amount : null;
  const diff = prev !== null ? latest - prev : null;

  const chartData = [...entries].reverse().slice(-20).map((e) => ({
    time: new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(e.timestamp)),
    amount: e.amount,
  }));

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Tiền của con 💛</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Be+Vietnam+Pro:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div style={s.page}>
        <div style={s.bgGlow} />

        <header style={s.header}>
          <div style={s.headerInner}>
            <div>
              <p style={s.greeting}>Kính gửi Mẹ 🌸</p>
              <h1 style={s.siteTitle}>Ví của con</h1>
            </div>
            <div style={s.clock}>
              <span style={s.clockLabel}>Giờ hiện tại</span>
              <span style={s.clockTime}>{now}</span>
            </div>
          </div>
        </header>

        <main style={s.main}>
          <div style={s.balanceCard}>
            <div style={s.balanceGlow} />
            <p style={s.balanceLabel}>Số tiền hiện tại trong người con</p>
            {loading
              ? <p style={{ color: "#e8d5b7", fontSize: 20, padding: "20px 0" }}>Đang tải...</p>
              : <>
                  <p style={s.balanceAmount}>{formatVND(latest)}</p>
                  <p style={s.balanceSub}>{formatShort(latest)}</p>
                </>
            }
            {diff !== null && (
              <div style={{ ...s.diffBadge, background: diff >= 0 ? "#27ae601a" : "#c0392b1a", border: `1px solid ${diff >= 0 ? "#27ae60" : "#c0392b"}` }}>
                <span style={{ color: diff >= 0 ? "#a8e6cf" : "#ff8a80", fontWeight: 600 }}>
                  {diff >= 0 ? "▲" : "▼"} {formatVND(Math.abs(diff))}
                </span>
                <span style={{ color: "#e8d5b7", fontSize: 12, marginLeft: 8 }}>so với lần trước</span>
              </div>
            )}
            {entries.length > 0 && <p style={s.lastUpdate}>Cập nhật lúc: {formatTime(entries[0].timestamp)}</p>}
          </div>

          {chartData.length >= 2 && (
            <div style={s.card}>
              <h2 style={s.cardTitle}>📈 Biến động số tiền</h2>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8d5b7" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#8b6f52" }} angle={-30} textAnchor="end" height={50} />
                    <YAxis tickFormatter={(v) => formatShort(v)} tick={{ fontSize: 10, fill: "#8b6f52" }} width={60} />
                    <Tooltip
                      formatter={(value: number) => [formatVND(value), "Số tiền"]}
                      contentStyle={{ background: "#fff9f0", border: "1px solid #e8d5b7", borderRadius: 12, fontFamily: "'Be Vietnam Pro',sans-serif" }}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#c8923a" strokeWidth={3}
                      dot={{ r: 5, fill: "#c8923a", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div style={s.card}>
            <h2 style={s.cardTitle}>🕐 Lịch sử cập nhật</h2>
            {loading
              ? <p style={{ color: "#8b6f52", textAlign: "center", padding: "24px" }}>Đang tải...</p>
              : entries.length === 0
                ? <p style={{ color: "#8b6f52", textAlign: "center", padding: "32px 0" }}>Chưa có dữ liệu.</p>
                : <div style={s.timeline}>
                    {entries.map((entry, i) => {
                      const prevE = i < entries.length - 1 ? entries[i + 1] : null;
                      const d = prevE ? entry.amount - prevE.amount : null;
                      return (
                        <div key={entry.id} style={s.timelineItem}>
                          <div style={s.dotCol}>
                            <div style={{ ...s.dot, background: i === 0 ? "#c8923a" : "#e8d5b7", border: i === 0 ? "3px solid #9a6a20" : "2px solid #c8923a" }} />
                            {i < entries.length - 1 && <div style={s.dotLine} />}
                          </div>
                          <div style={{ ...s.tCard, ...(i === 0 ? s.tCardActive : {}) }}>
                            <div style={s.tTop}>
                              <span style={s.tAmount}>{formatVND(entry.amount)}</span>
                              {d !== null && <span style={{ fontSize: 13, color: d >= 0 ? "#27ae60" : "#c0392b", fontWeight: 600 }}>{d >= 0 ? "+" : ""}{formatVND(d)}</span>}
                            </div>
                            {entry.note && <p style={s.tNote}>"{entry.note}"</p>}
                            <p style={s.tTime}>{formatTime(entry.timestamp)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
            }
          </div>
        </main>

        <footer style={s.footer}>
          Con yêu Mẹ 💛 &nbsp;|&nbsp; <Link href="/admin" style={{ color: "#c8923a" }}>Trang cập nhật</Link>
        </footer>
      </div>
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#fdf6ec", position: "relative" },
  bgGlow: { position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle at 20% 20%, rgba(200,146,58,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(200,146,58,0.06) 0%, transparent 50%)", pointerEvents: "none", zIndex: 0 },
  header: { background: "linear-gradient(135deg, #3d2b1f 0%, #6b4c38 100%)", padding: "24px 24px 32px", position: "relative", zIndex: 1 },
  headerInner: { maxWidth: 680, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" },
  greeting: { color: "#e8b96a", fontSize: 14, fontWeight: 300, letterSpacing: 1, marginBottom: 4 },
  siteTitle: { fontFamily: "'Playfair Display', serif", color: "#fdf6ec", fontSize: 28, fontWeight: 700 },
  clock: { display: "flex", flexDirection: "column", alignItems: "flex-end" },
  clockLabel: { color: "#e8b96a", fontSize: 12, marginBottom: 2 },
  clockTime: { color: "#fdf6ec", fontSize: 22, fontWeight: 600 },
  main: { maxWidth: 680, margin: "0 auto", padding: "0 16px 80px", position: "relative", zIndex: 1 },
  balanceCard: { background: "linear-gradient(135deg, #3d2b1f 0%, #6b4c38 100%)", borderRadius: 24, padding: "36px 32px", margin: "-20px 0 24px", textAlign: "center", position: "relative", overflow: "hidden", boxShadow: "0 20px 60px rgba(61,43,31,0.3)" },
  balanceGlow: { position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)", width: 300, height: 300, background: "radial-gradient(circle, rgba(200,146,58,0.25) 0%, transparent 70%)", pointerEvents: "none" },
  balanceLabel: { color: "#e8b96a", fontSize: 14, marginBottom: 16 },
  balanceAmount: { fontFamily: "'Playfair Display', serif", color: "#fdf6ec", fontSize: "clamp(28px, 7vw, 42px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 8 },
  balanceSub: { color: "#c8923a", fontSize: 18, fontWeight: 500, marginBottom: 16 },
  diffBadge: { display: "inline-flex", alignItems: "center", padding: "6px 16px", borderRadius: 100, marginBottom: 16 },
  lastUpdate: { color: "#e8d5b7", fontSize: 12, opacity: 0.7 },
  card: { background: "#fff9f0", border: "1px solid #e8d5b7", borderRadius: 20, padding: "24px 20px", marginBottom: 20, boxShadow: "0 4px 20px rgba(61,43,31,0.06)" },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#3d2b1f", marginBottom: 20 },
  timeline: { display: "flex", flexDirection: "column" },
  timelineItem: { display: "flex", gap: 16 },
  dotCol: { display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 4 },
  dot: { width: 14, height: 14, borderRadius: "50%", flexShrink: 0 },
  dotLine: { flex: 1, width: 2, background: "#e8d5b7", margin: "4px 0", minHeight: 16 },
  tCard: { flex: 1, background: "#fff", border: "1px solid #e8d5b7", borderRadius: 14, padding: "14px 16px", marginBottom: 12 },
  tCardActive: { borderColor: "#c8923a", background: "linear-gradient(135deg, #fff9f0, #fff)" },
  tTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, flexWrap: "wrap", gap: 4 },
  tAmount: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#3d2b1f" },
  tNote: { color: "#8b6f52", fontSize: 13, fontStyle: "italic", marginBottom: 4 },
  tTime: { color: "#b09070", fontSize: 12 },
  footer: { textAlign: "center", padding: "24px", color: "#8b6f52", fontSize: 14, position: "relative", zIndex: 1 },
};
