// statCard.js
export default function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: "#f7f7f8",
      padding: "1rem",
      borderRadius: 8,
      textAlign: "center"
    }}>
      <div style={{ fontSize: "1.5rem", fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: "0.9rem", color: "#666" }}>{label}</div>
    </div>
  );
}