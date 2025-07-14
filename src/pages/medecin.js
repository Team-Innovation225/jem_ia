import React, { useState } from "react";
import {
  FaUserMd, FaUsers, FaBell, FaCalendarAlt, FaNotesMedical, FaFilePrescription, FaComments, FaUserCircle, FaStethoscope, FaPaperclip, FaVideo, FaChevronRight, FaHospital
} from "react-icons/fa";

// Structures fictives pour la démo
const fakeStructures = [
  { id: 1, nom: "CHR de Cocody" },
  { id: 2, nom: "Clinique Sainte-Marie" }
];

// Patients fictifs par structure
const fakePatientsByStructure = {
  1: [
    { id: 1, nom: "Kouassi", prenom: "Marie", age: 32, sexe: "Femme", derniereConsult: "08/07/2025", etat: "Stable" },
    { id: 2, nom: "Traoré", prenom: "Yao", age: 45, sexe: "Homme", derniereConsult: "07/07/2025", etat: "A surveiller" },
  ],
  2: [
    { id: 3, nom: "Konan", prenom: "Awa", age: 28, sexe: "Femme", derniereConsult: "06/07/2025", etat: "Urgence" },
  ]
};

const fakeAlertsByStructure = {
  1: [
    { id: 1, patient: "Marie Kouassi", date: "08/07/2025", type: "Fièvre élevée" },
    { id: 2, patient: "Yao Traoré", date: "07/07/2025", type: "Symptômes suspects" },
  ],
  2: [
    { id: 3, patient: "Awa Konan", date: "06/07/2025", type: "Urgence IA" },
  ]
};

const fakeConsultsByStructure = {
  1: [
    { id: 1, patient: "Marie Kouassi", date: "09/07/2025 10:00" },
    { id: 2, patient: "Yao Traoré", date: "09/07/2025 14:00" },
  ],
  2: [
    { id: 3, patient: "Awa Konan", date: "10/07/2025 09:00" },
  ]
};

const fakeDossiers = {
  1: {
    nom: "Marie Kouassi",
    age: 32,
    sexe: "Femme",
    groupeSanguin: "A+",
    historique: [
      { date: "08/07/2025", symptome: "Fièvre, toux", diagnostic: "Grippe", confiance: 0.92 },
      { date: "01/07/2025", symptome: "Maux de tête", diagnostic: "Migraine", confiance: 0.85 },
    ],
    ordonnances: [
      { id: 1, date: "08/07/2025", medicament: "Paracétamol", posologie: "500mg x3/j", duree: "5j", remarque: "Prendre après repas" },
    ],
    documents: [
      { id: 1, nom: "Analyse_sang.pdf", url: "#" },
    ],
    messages: [
      { from: "patient", text: "Bonjour docteur, j'ai reçu l'ordonnance.", time: "08:30" },
      { from: "medecin", text: "Parfait, tenez-moi informé de l'évolution.", time: "08:32" },
    ]
  },
  2: {
    nom: "Yao Traoré",
    age: 45,
    sexe: "Homme",
    groupeSanguin: "O-",
    historique: [
      { date: "07/07/2025", symptome: "Fatigue", diagnostic: "Anémie", confiance: 0.88 },
    ],
    ordonnances: [],
    documents: [],
    messages: []
  },
  3: {
    nom: "Awa Konan",
    age: 28,
    sexe: "Femme",
    groupeSanguin: "B+",
    historique: [
      { date: "06/07/2025", symptome: "Douleurs abdominales", diagnostic: "Appendicite", confiance: 0.95 },
    ],
    ordonnances: [],
    documents: [],
    messages: []
  }
};

export default function MedecinDashboard() {
  // Structure active
  const [structureId, setStructureId] = useState(fakeStructures[0].id);
  const structureActive = fakeStructures.find(s => s.id === structureId);

  // Vues
  const [vue, setVue] = useState("dashboard"); // dashboard | patients | dossier | ordonnances | messages | profil
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [ordonnance, setOrdonnance] = useState({ medicament: "", posologie: "", duree: "", remarque: "" });
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Couleurs
  const colors = {
    bleu: "#2e7dff",
    vert: "#38b6ff",
    vertDoux: "#b6fcd5",
    gris: "#f7f7f8",
    grisFonce: "#e0eafc",
    blanc: "#fff",
    accent: "#38b6ff",
    danger: "#e53e3e",
  };

  // Sidebar
  const sidebarLinks = [
    { label: "Tableau de bord", icon: <FaStethoscope />, vue: "dashboard" },
    { label: "Mes Patients", icon: <FaUsers />, vue: "patients" },
    { label: "Ordonnances", icon: <FaFilePrescription />, vue: "ordonnances" },
    { label: "Messages", icon: <FaComments />, vue: "messages" },
    { label: "Mon Profil", icon: <FaUserMd />, vue: "profil" },
  ];

  // Patients, alertes, consults filtrés par structure
  const patients = fakePatientsByStructure[structureId] || [];
  const alerts = fakeAlertsByStructure[structureId] || [];
  const consults = fakeConsultsByStructure[structureId] || [];

  // Dossier patient sélectionné
  const dossier = selectedPatient ? fakeDossiers[selectedPatient.id] : null;

  // Met à jour la messagerie si patient sélectionné
  React.useEffect(() => {
    if (selectedPatient && dossier) setMessages(dossier.messages || []);
  }, [selectedPatient, dossier]);

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      fontFamily: "Segoe UI, Arial, sans-serif",
      background: colors.gris,
    }}>
      {/* Sidebar */}
      <nav style={{
        width: 240,
        background: colors.blanc,
        borderRight: `1px solid ${colors.grisFonce}`,
        padding: "2rem 0 1rem 0",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        minHeight: "100vh",
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <FaStethoscope size={36} color={colors.bleu} />
          <div style={{ fontWeight: 700, fontSize: "1.3rem", color: colors.bleu, marginTop: 8 }}>SantéAI Médecin</div>
        </div>
        <div style={{ flex: 1 }}>
          {sidebarLinks.map(link => (
            <button
              key={link.vue}
              onClick={() => setVue(link.vue)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                width: "100%",
                background: vue === link.vue ? colors.bleu : "transparent",
                color: vue === link.vue ? "#fff" : "#222",
                border: "none",
                borderRadius: "8px",
                padding: "0.9rem 1.5rem",
                fontWeight: 600,
                fontSize: "1.08rem",
                cursor: "pointer",
                marginBottom: "0.5rem",
                transition: "background 0.2s",
              }}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Contenu principal */}
      <main style={{ flex: 1, padding: "2.5rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
        {/* Sélecteur de structure */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "1.2rem",
          marginBottom: "2rem",
          background: colors.blanc,
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
          padding: "1rem 2rem",
        }}>
          <FaHospital color={colors.bleu} />
          <span style={{ fontWeight: 700, color: colors.bleu }}>Structure :</span>
          <select
            value={structureId}
            onChange={e => {
              setStructureId(Number(e.target.value));
              setSelectedPatient(null);
              setVue("dashboard");
            }}
            style={{
              fontSize: "1.08rem",
              padding: "0.5rem 1rem",
              borderRadius: 8,
              border: `1px solid ${colors.grisFonce}`,
              background: colors.gris,
              fontWeight: 600,
              color: colors.bleu,
              outline: "none"
            }}
          >
            {fakeStructures.map(s => (
              <option key={s.id} value={s.id}>{s.nom}</option>
            ))}
          </select>
        </div>

        {/* Tableau de bord */}
        {vue === "dashboard" && (
          <section>
            <div style={{ display: "flex", gap: "2rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
              <div style={{
                background: colors.blanc, borderRadius: 14, boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
                padding: "2rem", flex: 1, minWidth: 220, display: "flex", flexDirection: "column", alignItems: "center"
              }}>
                <FaUsers size={32} color={colors.bleu} />
                <div style={{ fontWeight: 700, fontSize: "1.2rem", margin: "1rem 0 0.5rem 0" }}>{patients.length}</div>
                <div>Patients suivis</div>
              </div>
              <div style={{
                background: colors.blanc, borderRadius: 14, boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
                padding: "2rem", flex: 1, minWidth: 220, display: "flex", flexDirection: "column", alignItems: "center"
              }}>
                <FaBell size={32} color={colors.danger} />
                <div style={{ fontWeight: 700, fontSize: "1.2rem", margin: "1rem 0 0.5rem 0" }}>{alerts.length}</div>
                <div>Alertes IA à vérifier</div>
              </div>
              <div style={{
                background: colors.blanc, borderRadius: 14, boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
                padding: "2rem", flex: 1, minWidth: 220, display: "flex", flexDirection: "column", alignItems: "center"
              }}>
                <FaCalendarAlt size={32} color={colors.vert} />
                <div style={{ fontWeight: 700, fontSize: "1.2rem", margin: "1rem 0 0.5rem 0" }}>{consults.length}</div>
                <div>Consultations à venir</div>
              </div>
            </div>
            {/* Alertes */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: colors.bleu, marginBottom: 8 }}>Alertes IA</div>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {alerts.map(alert => (
                  <li key={alert.id} style={{
                    background: "#fff7f7",
                    borderLeft: `4px solid ${colors.danger}`,
                    borderRadius: 8,
                    marginBottom: 8,
                    padding: "1rem 1.2rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.2rem"
                  }}>
                    <FaBell color={colors.danger} />
                    <span style={{ fontWeight: 600 }}>{alert.patient}</span>
                    <span style={{ color: "#888" }}>{alert.type}</span>
                    <span style={{ marginLeft: "auto", color: "#aaa" }}>{alert.date}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Consultations à venir */}
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: colors.bleu, marginBottom: 8 }}>Consultations à venir</div>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {consults.map(c => (
                  <li key={c.id} style={{
                    background: "#f7f7f8",
                    borderRadius: 8,
                    marginBottom: 8,
                    padding: "1rem 1.2rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.2rem"
                  }}>
                    <FaCalendarAlt color={colors.vert} />
                    <span style={{ fontWeight: 600 }}>{c.patient}</span>
                    <span style={{ marginLeft: "auto", color: "#aaa" }}>{c.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Mes Patients */}
        {vue === "patients" && (
          <section>
            <div style={{ fontWeight: 700, fontSize: "1.3rem", color: colors.bleu, marginBottom: "1.5rem" }}>Mes Patients</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "1.5rem" }}>
              {patients.map(p => (
                <div key={p.id} style={{
                  background: colors.blanc,
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(46,125,255,0.06)",
                  padding: "1.2rem 1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.7rem",
                  position: "relative"
                }}>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{p.prenom} {p.nom}</div>
                  <div>Âge : {p.age} ans</div>
                  <div>Sexe : {p.sexe}</div>
                  <div>Dernière consultation : <span style={{ color: colors.bleu }}>{p.derniereConsult}</span></div>
                  <div>État : <span style={{
                    color: p.etat === "Urgence" ? colors.danger : (p.etat === "A surveiller" ? colors.vert : colors.bleu),
                    fontWeight: 600
                  }}>{p.etat}</span></div>
                  <button
                    style={{
                      position: "absolute",
                      right: 16,
                      top: 16,
                      background: colors.bleu,
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: 34,
                      height: 34,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    title="Voir le dossier"
                    onClick={() => { setSelectedPatient(p); setVue("dossier"); }}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dossier Patient */}
        {vue === "dossier" && selectedPatient && dossier && (
          <section>
            <button onClick={() => setVue("patients")} style={{
              background: "none", border: "none", color: colors.bleu, fontWeight: 600, marginBottom: 16, cursor: "pointer"
            }}>← Retour à la liste des patients</button>
            <div style={{
              background: colors.blanc,
              borderRadius: 14,
              boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
              padding: "2rem",
              marginBottom: "2rem"
            }}>
              <div style={{ display: "flex", gap: "2rem", alignItems: "center", marginBottom: "1.5rem" }}>
                <FaUserCircle size={54} color={colors.bleu} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.2rem" }}>{dossier.nom}</div>
                  <div>Âge : {dossier.age} ans</div>
                  <div>Sexe : {dossier.sexe}</div>
                  <div>Groupe sanguin : {dossier.groupeSanguin}</div>
                </div>
              </div>
              <div style={{ marginBottom: "1.2rem" }}>
                <div style={{ fontWeight: 700, color: colors.bleu, marginBottom: 8 }}>Historique des symptômes</div>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {dossier.historique.map((h, i) => (
                    <li key={i} style={{
                      background: "#f7f7f8",
                      borderRadius: 8,
                      marginBottom: 8,
                      padding: "0.8rem 1.2rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "1.2rem"
                    }}>
                      <FaNotesMedical color={colors.bleu} />
                      <span>{h.date} : {h.symptome}</span>
                      <span style={{ marginLeft: "auto", color: "#888" }}>
                        Diagnostic : <b>{h.diagnostic}</b> (Confiance : {(h.confiance * 100).toFixed(0)}%)
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ marginBottom: "1.2rem" }}>
                <div style={{ fontWeight: 700, color: colors.bleu, marginBottom: 8 }}>Ordonnances</div>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {dossier.ordonnances.map(o => (
                    <li key={o.id} style={{
                      background: "#e0eafc",
                      borderRadius: 8,
                      marginBottom: 8,
                      padding: "0.8rem 1.2rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "1.2rem"
                    }}>
                      <FaFilePrescription color={colors.bleu} />
                      <span>{o.date} : {o.medicament} ({o.posologie}, {o.duree})</span>
                      <span style={{ marginLeft: "auto", color: "#888" }}>{o.remarque}</span>
                    </li>
                  ))}
                </ul>
                {/* Zone de prescription */}
                <form style={{ marginTop: 12, display: "flex", gap: "0.7rem", flexWrap: "wrap" }} onSubmit={e => {
                  e.preventDefault();
                  // Ajout fictif (à remplacer par appel backend)
                  dossier.ordonnances.push({
                    id: Date.now(),
                    date: new Date().toLocaleDateString(),
                    medicament: ordonnance.medicament,
                    posologie: ordonnance.posologie,
                    duree: ordonnance.duree,
                    remarque: ordonnance.remarque
                  });
                  setOrdonnance({ medicament: "", posologie: "", duree: "", remarque: "" });
                }}>
                  <input type="text" placeholder="Médicament" required value={ordonnance.medicament} onChange={e => setOrdonnance({ ...ordonnance, medicament: e.target.value })} style={{ flex: 1, borderRadius: 8, border: "1px solid #e0eafc", padding: 8 }} />
                  <input type="text" placeholder="Posologie" required value={ordonnance.posologie} onChange={e => setOrdonnance({ ...ordonnance, posologie: e.target.value })} style={{ flex: 1, borderRadius: 8, border: "1px solid #e0eafc", padding: 8 }} />
                  <input type="text" placeholder="Durée" required value={ordonnance.duree} onChange={e => setOrdonnance({ ...ordonnance, duree: e.target.value })} style={{ flex: 1, borderRadius: 8, border: "1px solid #e0eafc", padding: 8 }} />
                  <input type="text" placeholder="Remarque" value={ordonnance.remarque} onChange={e => setOrdonnance({ ...ordonnance, remarque: e.target.value })} style={{ flex: 1, borderRadius: 8, border: "1px solid #e0eafc", padding: 8 }} />
                  <button type="submit" style={{
                    background: colors.bleu,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "0.7rem 1.2rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}>Envoyer</button>
                </form>
              </div>
              <div style={{ marginBottom: "1.2rem" }}>
                <div style={{ fontWeight: 700, color: colors.bleu, marginBottom: 8 }}>Documents médicaux</div>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {dossier.documents.map(doc => (
                    <li key={doc.id} style={{
                      background: "#f7f7f8",
                      borderRadius: 8,
                      marginBottom: 8,
                      padding: "0.8rem 1.2rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "1.2rem"
                    }}>
                      <FaPaperclip color={colors.bleu} />
                      <a href={doc.url} style={{ color: colors.bleu, textDecoration: "underline" }}>{doc.nom}</a>
                    </li>
                  ))}
                </ul>
                <button style={{
                  marginTop: 8,
                  background: colors.bleu,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "0.7rem 1.2rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}>Ajouter un document</button>
              </div>
              {/* Zone de notes */}
              <div>
                <div style={{ fontWeight: 700, color: colors.bleu, marginBottom: 8 }}>Notes du médecin</div>
                <textarea placeholder="Ajouter une note..." style={{
                  width: "100%", minHeight: 60, borderRadius: 8, border: "1px solid #e0eafc", padding: 10, fontSize: "1rem"
                }} />
                <button style={{
                  marginTop: 8,
                  background: colors.vert,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "0.7rem 1.2rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}>Enregistrer</button>
              </div>
              {/* Messagerie patient */}
              <div style={{ marginTop: 24 }}>
                <div style={{ fontWeight: 700, color: colors.bleu, marginBottom: 8 }}>Messagerie avec le patient</div>
                <div style={{
                  background: colors.gris,
                  borderRadius: 10,
                  padding: "1rem",
                  minHeight: 80,
                  marginBottom: 8,
                  fontSize: "1rem",
                  color: "#222",
                  border: "1px solid #e0eafc",
                  maxHeight: 180,
                  overflowY: "auto"
                }}>
                  {messages.map((msg, idx) => (
                    <div key={idx} style={{
                      display: "flex",
                      flexDirection: msg.from === "medecin" ? "row-reverse" : "row",
                      alignItems: "flex-end",
                      gap: "0.7rem",
                      marginBottom: 8
                    }}>
                      <div style={{
                        background: msg.from === "medecin" ? colors.bleu : colors.grisFonce,
                        color: msg.from === "medecin" ? "#fff" : "#222",
                        borderRadius: "12px",
                        padding: "0.8rem 1.1rem",
                        maxWidth: "70%",
                        fontSize: "1.05rem",
                        fontWeight: 500,
                      }}>
                        {msg.text}
                      </div>
                      <span style={{ fontSize: "0.9rem", color: "#aaa" }}>{msg.time}</span>
                    </div>
                  ))}
                </div>
                <form onSubmit={e => {
                  e.preventDefault();
                  if (message.trim()) {
                    setMessages([...messages, { from: "medecin", text: message, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
                    setMessage("");
                  }
                }} style={{ display: "flex", gap: "0.7rem" }}>
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Votre message..."
                    style={{
                      flex: 1,
                      borderRadius: 8,
                      border: "1px solid #e0eafc",
                      padding: "0.7rem 1rem",
                      fontSize: "1rem"
                    }}
                  />
                  <button type="submit" style={{
                    background: colors.bleu,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "0.7rem 1.2rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}>
                    <FaComments />
                  </button>
                  <button type="button" style={{
                    background: colors.vert,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "0.7rem 1.2rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}>
                    <FaVideo /> {/* Lancer téléconsultation */}
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* Ordonnances (hors dossier patient) */}
        {vue === "ordonnances" && (
          <section>
            <div style={{ fontWeight: 700, fontSize: "1.3rem", color: colors.bleu, marginBottom: "1.5rem" }}>Créer une ordonnance</div>
            <form style={{
              background: colors.blanc,
              borderRadius: 14,
              boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
              padding: "2rem",
              maxWidth: 500,
              display: "flex",
              flexDirection: "column",
              gap: "1.2rem"
            }}>
              <label>
                Médicament :
                <input type="text" value={ordonnance.medicament} onChange={e => setOrdonnance({ ...ordonnance, medicament: e.target.value })} style={{ width: "100%" }} />
              </label>
              <label>
                Posologie :
                <input type="text" value={ordonnance.posologie} onChange={e => setOrdonnance({ ...ordonnance, posologie: e.target.value })} style={{ width: "100%" }} />
              </label>
              <label>
                Durée :
                <input type="text" value={ordonnance.duree} onChange={e => setOrdonnance({ ...ordonnance, duree: e.target.value })} style={{ width: "100%" }} />
              </label>
              <label>
                Remarques :
                <input type="text" value={ordonnance.remarque} onChange={e => setOrdonnance({ ...ordonnance, remarque: e.target.value })} style={{ width: "100%" }} />
              </label>
              <div style={{ display: "flex", gap: "1rem", marginTop: 8 }}>
                <button type="submit" style={btnStyle(colors.bleu)}>Enregistrer</button>
                <button type="button" style={btnStyle(colors.vert)}>Imprimer</button>
                <button type="button" style={btnStyle(colors.accent)}>Envoyer au patient</button>
              </div>
            </form>
          </section>
        )}

        {/* Messagerie (hors dossier patient) */}
        {vue === "messages" && (
          <section>
            <div style={{ fontWeight: 700, fontSize: "1.3rem", color: colors.bleu, marginBottom: "1.5rem" }}>Messagerie</div>
            <div style={{
              background: colors.blanc,
              borderRadius: 14,
              boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
              padding: "2rem",
              maxWidth: 600,
              marginBottom: "2rem"
            }}>
              <div style={{ minHeight: 200, marginBottom: 16 }}>
                <div style={{ color: "#888" }}>(Sélectionner un patient pour accéder à la messagerie dédiée)</div>
              </div>
            </div>
          </section>
        )}

        {/* Profil */}
        {vue === "profil" && (
          <section>
            <div style={{
              background: colors.blanc,
              borderRadius: 14,
              boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
              padding: "2rem",
              maxWidth: 500,
              margin: "0 auto"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginBottom: 16 }}>
                <FaUserMd size={48} color={colors.bleu} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.2rem" }}>Dr. Coulibaly</div>
                  <div style={{ color: "#888" }}>Médecin généraliste</div>
                  <div style={{ color: "#888" }}>coulibaly@santeai.com</div>
                  <div style={{ color: colors.bleu, fontWeight: 600, marginTop: 4 }}>Structure : {structureActive.nom}</div>
                </div>
              </div>
              <button style={{
                background: colors.bleu,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "0.7rem 1.2rem",
                fontWeight: 600,
                cursor: "pointer"
              }}>
                Modifier mes informations
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// Style bouton utilitaire
function btnStyle(bg) {
  return {
    background: bg,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "0.7rem 1.2rem",
    fontWeight: 600,
    cursor: "pointer"
  };
}