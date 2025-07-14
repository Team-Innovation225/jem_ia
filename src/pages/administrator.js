import React, { useState } from "react";
import {
  FaHospital, FaUserMd, FaUsers, FaCalendarAlt, FaBell, FaCog, FaPlus, FaUserNurse, FaUserTie
} from "react-icons/fa";

// Styles centralisés
const styles = {
  root: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "sans-serif",
    background: "linear-gradient(135deg, #e0f2fe 0%, #e6fffa 100%)",
  },
  sidebar: {
    width: 260,
    minWidth: 200,
    background: "#fff",
    borderRight: "1px solid #dbeafe",
    display: "flex",
    flexDirection: "column",
    boxShadow: "2px 0 12px rgba(46,125,255,0.04)",
    height: "100vh",
    position: "sticky",
    top: 0,
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "2rem 1.5rem 1rem 1.5rem",
    borderBottom: "1px solid #dbeafe",
  },
  sidebarTitle: {
    fontWeight: 700,
    color: "#2563eb",
    fontSize: "1.3rem",
    letterSpacing: "-1px",
  },
  sidebarSelectBlock: {
    padding: "1.2rem 1.5rem 0.5rem 1.5rem",
  },
  sidebarLabel: {
    fontSize: "0.85rem",
    color: "#64748b",
    marginBottom: 4,
    display: "block",
    fontWeight: 500,
  },
  sidebarSelect: {
    width: "100%",
    border: "1px solid #bae6fd",
    borderRadius: "0.75rem",
    padding: "0.5rem 1rem",
    color: "#2563eb",
    fontWeight: 600,
    background: "#f0f9ff",
    fontSize: "1rem",
    outline: "none",
    marginBottom: "1rem",
  },
  sidebarNav: {
    flex: 1,
    padding: "1rem 1.2rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  sidebarBtn: isActive => ({
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0.7rem 1rem",
    borderRadius: "0.75rem",
    fontWeight: isActive ? 700 : 500,
    color: isActive ? "#2563eb" : "#334155",
    background: isActive ? "#e0eafc" : "transparent",
    border: "none",
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s",
    outline: "none",
  }),
  main: {
    flex: 1,
    padding: "2.5rem",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: "2rem",
  },
  headerTitle: {
    fontWeight: 800,
    color: "#2563eb",
    fontSize: "2rem",
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "2rem",
    marginBottom: "2.5rem",
  },
  dashboardCard: borderColor => ({
    background: "#fff",
    borderRadius: "1.2rem",
    boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
    padding: "2rem 1.2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: `2px solid ${borderColor}`,
  }),
  table: {
    width: "100%",
    background: "#fff",
    borderRadius: "1rem",
    boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
    border: "1px solid #dbeafe",
    marginBottom: "2rem",
    overflow: "hidden",
  },
  th: {
    background: "#e0eafc",
    color: "#2563eb",
    fontWeight: 700,
    padding: "0.8rem 1rem",
    textAlign: "left",
    fontSize: "1rem",
  },
  td: {
    padding: "0.7rem 1rem",
    fontSize: "1rem",
    color: "#334155",
    borderBottom: "1px solid #e0eafc",
  },
  sectionTitle: {
    fontWeight: 700,
    color: "#2563eb",
    fontSize: "1.3rem",
    marginBottom: "1.2rem",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#2563eb",
    color: "#fff",
    padding: "0.7rem 1.2rem",
    borderRadius: "0.75rem",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(46,125,255,0.08)",
    fontSize: "1rem",
    transition: "background 0.2s",
  },
};

// Données fictives pour la démo
const structures = [
  { id: 1, nom: "CHR de Korhogo" },
  { id: 2, nom: "Clinique Santé Plus" }
];

const fakeDashboard = {
  medecins: 12,
  patients: 230,
  consultations: 540,
  alertes: 3
};

const fakePersonnel = [
  { id: 1, nom: "Dr. Koné", role: "Médecin" },
  { id: 2, nom: "Awa Traoré", role: "Infirmier" },
  { id: 3, nom: "M. Diabaté", role: "Assistant" }
];

const fakePatients = [
  { id: 1, nom: "Marie Kouassi", age: 32, sexe: "Femme", derniereConsult: "08/07/2025" },
  { id: 2, nom: "Yao Traoré", age: 45, sexe: "Homme", derniereConsult: "07/07/2025" }
];

const fakeAgenda = [
  { id: 1, date: "12/07/2025", heure: "09:00", patient: "Marie Kouassi", medecin: "Dr. Koné" },
  { id: 2, date: "12/07/2025", heure: "11:00", patient: "Yao Traoré", medecin: "Dr. Koné" }
];

export default function Administrator() {
  const [structureId, setStructureId] = useState(structures[0].id);
  const [page, setPage] = useState("dashboard");
  const structureActive = structures.find(s => s.id === structureId);

  return (
    <div style={styles.root}>
      {/* Menu latéral */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <FaHospital style={{ color: "#2563eb", fontSize: 28 }} />
          <span style={styles.sidebarTitle}>SantéAI Admin</span>
        </div>
        <div style={styles.sidebarSelectBlock}>
          <label style={styles.sidebarLabel}>Structure</label>
          <select
            style={styles.sidebarSelect}
            value={structureId}
            onChange={e => setStructureId(Number(e.target.value))}
          >
            {structures.map(s => (
              <option key={s.id} value={s.id}>{s.nom}</option>
            ))}
          </select>
        </div>
        <nav style={styles.sidebarNav}>
          <button
            style={styles.sidebarBtn(page === "dashboard")}
            onClick={() => setPage("dashboard")}
          >
            <FaBell /> Tableau de bord
          </button>
          <button
            style={styles.sidebarBtn(page === "personnel")}
            onClick={() => setPage("personnel")}
          >
            <FaUserMd /> Personnel médical
          </button>
          <button
            style={styles.sidebarBtn(page === "patients")}
            onClick={() => setPage("patients")}
          >
            <FaUsers /> Patients
          </button>
          <button
            style={styles.sidebarBtn(page === "agenda")}
            onClick={() => setPage("agenda")}
          >
            <FaCalendarAlt /> Agenda
          </button>
          <button
            style={styles.sidebarBtn(page === "parametres")}
            onClick={() => setPage("parametres")}
          >
            <FaCog /> Paramètres
          </button>
        </nav>
      </aside>

      {/* Contenu principal */}
      <main style={styles.main}>
        {/* En-tête structure */}
        <div style={styles.header}>
          <FaHospital style={{ color: "#2563eb", fontSize: 28 }} />
          <span style={styles.headerTitle}>{structureActive.nom}</span>
        </div>

        {/* Tableau de bord */}
        {page === "dashboard" && (
          <section>
            <div style={styles.dashboardGrid}>
              <div style={styles.dashboardCard("#bae6fd")}>
                <FaUserMd style={{ color: "#2563eb", fontSize: 32, marginBottom: 8 }} />
                <div style={{ fontSize: "2rem", fontWeight: 800 }}>{fakeDashboard.medecins}</div>
                <div style={{ color: "#64748b" }}>Médecins</div>
              </div>
              <div style={styles.dashboardCard("#bbf7d0")}>
                <FaUsers style={{ color: "#059669", fontSize: 32, marginBottom: 8 }} />
                <div style={{ fontSize: "2rem", fontWeight: 800 }}>{fakeDashboard.patients}</div>
                <div style={{ color: "#64748b" }}>Patients</div>
              </div>
              <div style={styles.dashboardCard("#bae6fd")}>
                <FaCalendarAlt style={{ color: "#38b6ff", fontSize: 32, marginBottom: 8 }} />
                <div style={{ fontSize: "2rem", fontWeight: 800 }}>{fakeDashboard.consultations}</div>
                <div style={{ color: "#64748b" }}>Consultations</div>
              </div>
              <div style={styles.dashboardCard("#fecaca")}>
                <FaBell style={{ color: "#ef4444", fontSize: 32, marginBottom: 8 }} />
                <div style={{ fontSize: "2rem", fontWeight: 800 }}>{fakeDashboard.alertes}</div>
                <div style={{ color: "#64748b" }}>Alertes IA à valider</div>
              </div>
            </div>
          </section>
        )}

        {/* Personnel médical */}
        {page === "personnel" && (
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div style={styles.sectionTitle}><FaUserMd /> Personnel médical</div>
              <button style={styles.addBtn}>
                <FaPlus /> Ajouter un membre
              </button>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nom</th>
                  <th style={styles.th}>Rôle</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fakePersonnel.map(m => (
                  <tr key={m.id}>
                    <td style={styles.td}>{m.nom}</td>
                    <td style={{ ...styles.td, display: "flex", alignItems: "center", gap: 8 }}>
                      {m.role === "Médecin" && <FaUserMd style={{ color: "#2563eb" }} />}
                      {m.role === "Infirmier" && <FaUserNurse style={{ color: "#059669" }} />}
                      {m.role === "Assistant" && <FaUserTie style={{ color: "#64748b" }} />}
                      {m.role}
                    </td>
                    <td style={styles.td}>
                      <button style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Voir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Patients */}
        {page === "patients" && (
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div style={styles.sectionTitle}><FaUsers /> Patients</div>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nom</th>
                  <th style={styles.th}>Âge</th>
                  <th style={styles.th}>Sexe</th>
                  <th style={styles.th}>Dernière consultation</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fakePatients.map(p => (
                  <tr key={p.id}>
                    <td style={styles.td}>{p.nom}</td>
                    <td style={styles.td}>{p.age}</td>
                    <td style={styles.td}>{p.sexe}</td>
                    <td style={styles.td}>{p.derniereConsult}</td>
                    <td style={styles.td}>
                      <button style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Voir dossier</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Agenda */}
        {page === "agenda" && (
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div style={styles.sectionTitle}><FaCalendarAlt /> Agenda</div>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Heure</th>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Médecin</th>
                </tr>
              </thead>
              <tbody>
                {fakeAgenda.map(a => (
                  <tr key={a.id}>
                    <td style={styles.td}>{a.date}</td>
                    <td style={styles.td}>{a.heure}</td>
                    <td style={styles.td}>{a.patient}</td>
                    <td style={styles.td}>{a.medecin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Paramètres */}
        {page === "parametres" && (
          <section>
            <div style={styles.sectionTitle}><FaCog /> Paramètres</div>
            <div style={{
              background: "#fff",
              borderRadius: "1rem",
              boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
              padding: "2rem",
              color: "#64748b",
              border: "1px solid #dbeafe"
            }}>
              <p>Gestion des paramètres de la structure (à compléter)</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}