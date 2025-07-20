import { FaUserMd, FaUsers, FaFilePrescription, FaExclamationTriangle, FaCalendarAlt, FaBell, FaClipboardList, FaComments, FaUpload } from "react-icons/fa";

const iconMap = {
  "Patients": <FaUsers size={28} />,
  "Consultations": <FaCalendarAlt size={28} />,
  "Ordonnances": <FaFilePrescription size={28} />,
  "Urgences IA": <FaExclamationTriangle size={28} />,
  "Nouveaux ce mois": <FaUserMd size={28} />,
  "Dossiers incomplets": <FaClipboardList size={28} />,
  "Consultations du jour": <FaCalendarAlt size={28} />,
  "Alertes IA (à surveiller)": <FaBell size={28} />,
  "Fichiers médicaux reçus": <FaUpload size={28} />,
  "Messages non lus": <FaComments size={28} />
};

export default function StatCard({ label, value, color }) {
  const icon = iconMap[label] || <FaUserMd size={28} />;

  return (
    <div
      style={{
        background: "#f7f7f8",
        padding: "1rem",
        borderRadius: 12,
        textAlign: "center",
        flex: "1 1 240px",
        minWidth: 0,
        boxSizing: "border-box",
        transition: "transform 0.3s ease",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <div style={{ marginBottom: "0.8rem", color }}>{icon}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.3rem" }}>{label}</div>
    </div>
  );
}