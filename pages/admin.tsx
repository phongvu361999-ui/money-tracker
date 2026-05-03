import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { fetchEntries, createEntry, removeEntry, formatVND, formatShort, formatTime, MoneyEntry } from "../lib/api";

const PRESETS = [50000, 100000, 200000, 500000, 1000000, 2000000, 5000000];

export default function Admin() {
  const [entries, setEntries] = useState<MoneyEntry[]>([]);
  const [amountStr, setAmountStr] = useState("");
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

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
  }, [load]);

  const handleSubmit = async () => {
    setError("");
    if (!amountStr) { setError("Vui lòng nhập số tiền."); return; }
    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount < 0) { setError("Số tiền không hợp lệ."); return; }
    setSubmitting(true);
    try {
      await createEntry(amount, note.trim());
      setAmountStr("");
      setNote("");
      setSuccess(true);
      await load();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Lỗi kết nối. Thử lại nhé!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeEntry(id);
      setConfirmId(null);
      await load();
    } catch { /* silent */ }
  };

  const latest = entries.length > 0 ? entries[0].amount : 0;
  const avg = entries.length > 0 ? entries.reduce((s, e) => s + e.amount, 0) / entries.length : 0;

  const chartData = [...entries].reverse().slice(-30).map((e) => ({
    time: new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(e.timestamp)),
    amount: e.amount,
  }));

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Admin — Cập nhật tiền</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Be+Vietnam+Pro:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div style={s.page}>
        <div style={s.bgPattern} />
        <header style={s.header}>
          <div style={s.headerInner}>
            <div>
              <p style={s.headerSub}>Trang quản lý</p>
              <h1 style={s.headerTitle}>Cập nhật số tiền</h1>
            </div>
            <Link href="/" style={s.viewBtn}>👀 Xem trang mẹ</Link>
          </div>
        </header>

        <main style={s.main}>
          {/* Stats */}
          <div style={s.statsRow}>
            <div style={s.statCard}>
              <p style={s.statLabel}>Hiện tại</p>
              <p style={s.statValue}>{formatShort(latest)}</p>
            </div>
            <div style={s.statCard}>
              <p style={s.statLabel}>Trung bình</p>
              <p style={s.statValue}>{formatShort(avg)}</p>
            </div>
            <div style={s.statCard}>
              <p style={s.statLabel}>Số lần cập nhật</p>
              <p style={s.statValue}>{entries.length}</p>
            </div>
          </div>

          {/* Form */}
          <div style={s.formCard}>
            <h2 style={s.formTitle}>➕ Cập nhật số tiền mới</h2>
            <div style={s.field}>
              <label style={s.label}>Số tiền (VNĐ)</label>
              <input
                type="tel"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value.replace(/\D/g, ""))}
                placeholder="Nhập số tiền, ví dụ: 500000"
                style={s.input}
              />
              {amountStr && <p style={s.hint}>→ {parseInt(amountStr).toLocaleString("vi-VN")} ₫ = {formatShort(parseInt(amountStr))}</p>}
            </div>
            <div style={s.field}>
              <label style={s.label}>Ghi chú (tuỳ chọn)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Vd: Đi làm về, nhận lương, đã tiêu..."
                style={s.input}
                maxLength={100}
              />
            </div>
            {error && <p style={s.errorMsg}>{error}</p>}
            {success && <p style={s.successMsg}>✅ Đã cập nhật thành công! Mẹ có thể xem rồi nhé.</p>}
            <button onClick={handleSubmit} disabled={submitting} style={{ ...s.submitBtn, opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Đang lưu..." : "Cập nhật ngay"}
            </button>
          </div>

          {/* Quick presets */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>⚡ Nhập nhanh</h2>
            <div style={s.presets}>
              {PRESETS.map((v) => (
                <button key={v} onClick={() => setAmountStr(v.toString())}
                  style={{ ...s.presetBtn, ...(amountStr === v.toString() ? s.presetActive : {}) }}>
                  {formatShort(v)}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          {chartData.length >= 2 && (
            <div style={s.card}>
              <h2 style={s.cardTitle}>📊 Biểu đồ lịch sử</h2>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8d5b7" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#8b6f52" }} angle={-30} textAnchor="end" height={50} />
                    <YAxis tickFormatter={(v) => formatShort(v)} tick={{ fontSize: 10, fill: "#8b6f52" }} width={65} />
                    <Tooltip
                      formatter={(value: number) => [formatVND(value), "Số tiền"]}
                      contentStyle={{ background: "#fff9f0", border: "1px solid #e8d5b7", borderRadius: 12, fontFamily: "'Be Vietnam Pro',sans-serif" }}
                    />
                    <ReferenceLine y={avg} stroke="#c8923a" strokeDasharray="4 4" label={{ value: "TB", fill: "#c8923a", fontSize: 11 }} />
                    <Line type="monotone" dataKey="amount" stroke="#3d2b1f" strokeWidth={2.5}
                      dot={{ r: 4, fill: "#3d2b1f", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* History */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>🗂 Lịch sử ({entries.length} lần)</h2>
            {loading
              ? <p style={{ color: "#8b6f52", textAlign: "center", padding: "24px" }}>Đang tải...</p>
              : entries.length === 0
                ? <p style={{ color: "#8b6f52", textAlign: "center", padding: "24px 0" }}>Chưa có dữ liệu.</p>
                : entries.map((entry, i) => {
                    const prevE = i < entries.length - 1 ? entries[i + 1] : null;
                    const d = prevE ? entry.amount - prevE.amount : null;
                    return (
                      <div key={entry.id} style={{ ...s.entryRow, borderBottom: i < entries.length - 1 ? "1px solid #f0e4d0" : "none" }}>
                        <div style={s.entryLeft}>
                          <div style={s.entryDot} />
                          <div style={{ minWidth: 0 }}>
                            <div style={s.entryTop}>
                              <span style={s.entryAmount}>{formatVND(entry.amount)}</span>
                              {d !== null && <span style={{ fontSize: 12, color: d >= 0 ? "#27ae60" : "#c0392b", fontWeight: 600 }}>{d >= 0 ? "+" : ""}{formatVND(d)}</span>}
                            </div>
                            {entry.note && <p style={s.entryNote}>"{entry.note}"</p>}
                            <p style={s.entryTime}>{formatTime(entry.timestamp)}</p>
                          </div>
                        </div>
                        {confirmId === entry.id
                          ? <div style={s.confirmRow}>
                              <span style={{ fontSize: 12, color: "#c0392b" }}>Xoá?</span>
                              <button onClick={() => handleDelete(entry.id)} style={s.confirmYes}>Có</button>
                              <button onClick={() => setConfirmId(null)} style={s.confirmNo}>Không</button>
                            </div>
                          : <button onClick={() => setConfirmId(entry.id)} style={s.deleteBtn} title="Xoá">🗑</button>
                        }
                      </div>
                    );
                  })
            }
          </div>
        </main>
      </div>
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#fdf6ec", position: "relative" },
  bgPattern: { position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle at 80% 10%, rgba(61,43,31,0.05) 0%, transparent 50%)", pointerEvents: "none", zIndex: 0 },
  header: { background: "linear-gradient(135deg, #2c1810 0%, #3d2b1f 100%)", padding: "24px 24px 32px", position: "relative", zIndex: 1 },
  headerInner: { maxWidth: 720, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerSub: { color: "#e8b96a", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 },
  headerTitle: { fontFamily: "'Playfair Display', serif", color: "#fdf6ec", fontSize: 26, fontWeight: 700 },
  viewBtn: { background: "rgba(200,146,58,0.2)", border: "1px solid rgba(200,146,58,0.5)", color: "#e8b96a", padding: "10px 18px", borderRadius: 100, fontSize: 14, fontWeight: 500 },
  main: { maxWidth: 720, margin: "0 auto", padding: "24px 16px 80px", position: "relative", zIndex: 1 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 },
  statCard: { background: "#fff9f0", border: "1px solid #e8d5b7", borderRadius: 16, padding: "16px 12px", textAlign: "center" },
  statLabel: { color: "#8b6f52", fontSize: 12, marginBottom: 6 },
  statValue: { fontFamily: "'Playfair Display', serif", color: "#3d2b1f", fontSize: 18, fontWeight: 700 },
  formCard: { background: "linear-gradient(135deg, #3d2b1f, #6b4c38)", borderRadius: 20, padding: "28px 24px", marginBottom: 20, boxShadow: "0 12px 40px rgba(61,43,31,0.25)" },
  formTitle: { fontFamily: "'Playfair Display', serif", color: "#fdf6ec", fontSize: 20, fontWeight: 700, marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { display: "block", color: "#e8d5b7", fontSize: 13, marginBottom: 8, fontWeight: 500 },
  input: { width: "100%", background: "rgba(253,246,236,0.12)", border: "1px solid rgba(232,217,183,0.3)", borderRadius: 12, padding: "14px 16px", fontSize: 16, color: "#fdf6ec", outline: "none" },
  hint: { color: "#e8b96a", fontSize: 14, marginTop: 6, fontWeight: 600 },
  errorMsg: { color: "#ff8a80", fontSize: 14, marginBottom: 12, background: "rgba(192,57,43,0.15)", padding: "8px 12px", borderRadius: 8 },
  successMsg: { color: "#a8e6cf", fontSize: 14, marginBottom: 12, background: "rgba(39,174,96,0.15)", padding: "8px 12px", borderRadius: 8 },
  submitBtn: { width: "100%", background: "linear-gradient(135deg, #c8923a, #e8b96a)", color: "#2c1810", border: "none", borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 700, letterSpacing: 0.5 },
  card: { background: "#fff9f0", border: "1px solid #e8d5b7", borderRadius: 20, padding: "24px 20px", marginBottom: 20 },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#3d2b1f", marginBottom: 16 },
  presets: { display: "flex", flexWrap: "wrap", gap: 10 },
  presetBtn: { background: "#fff", border: "1.5px solid #e8d5b7", borderRadius: 100, padding: "8px 18px", fontSize: 14, color: "#6b4c38", fontWeight: 500 },
  presetActive: { background: "#3d2b1f", border: "1.5px solid #3d2b1f", color: "#fdf6ec" },
  entryRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", gap: 12 },
  entryLeft: { display: "flex", alignItems: "flex-start", gap: 12, flex: 1, minWidth: 0 },
  entryDot: { width: 8, height: 8, borderRadius: "50%", background: "#c8923a", marginTop: 6, flexShrink: 0 },
  entryTop: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 2 },
  entryAmount: { fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#3d2b1f" },
  entryNote: { color: "#8b6f52", fontSize: 13, fontStyle: "italic", marginBottom: 2 },
  entryTime: { color: "#b09070", fontSize: 12 },
  deleteBtn: { background: "transparent", border: "none", fontSize: 18, opacity: 0.4, padding: "4px 8px", borderRadius: 8, flexShrink: 0 },
  confirmRow: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 },
  confirmYes: { background: "#c0392b", color: "#fff", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 600 },
  confirmNo: { background: "#eee", color: "#555", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 13 },
};
