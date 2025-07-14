import React, { useState } from "react";
import { FaHospital, FaMapMarkerAlt, FaUserMd, FaStethoscope, FaComments, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";

const fakeStructures = [
  {
    id: 1,
    nom: "CHR de Korhogo",
    localisation: "Korhogo",
    specialites: ["Cardiologie", "Pédiatrie", "Gynécologie"],
    medecins: [
      { id: 1, nom: "Dr. Koné", specialite: "Cardiologue", disponible: true },
      { id: 2, nom: "Dr. Traoré", specialite: "Pédiatre", disponible: false }
    ]
  },
  {
    id: 2,
    nom: "Clinique Santé Plus",
    localisation: "Bouaké",
    specialites: ["Généraliste", "Dermatologie"],
    medecins: [
      { id: 3, nom: "Dr. Coulibaly", specialite: "Généraliste", disponible: true }
    ]
  },
  {
    id: 3,
    nom: "Hôpital Général d'Abidjan",
    localisation: "Abidjan",
    specialites: ["Chirurgie", "Ophtalmologie"],
    medecins: [
      { id: 4, nom: "Dr. Yao", specialite: "Chirurgien", disponible: true },
      { id: 5, nom: "Dr. Kouassi", specialite: "Ophtalmologue", disponible: true }
    ]
  }
];

const allSpecialites = [
  ...new Set(fakeStructures.flatMap(s => s.specialites))
];

const allLocalisations = [
  ...new Set(fakeStructures.map(s => s.localisation))
];

export default function StructuresPage() {
  const [search, setSearch] = useState("");
  const [filtreLocalisation, setFiltreLocalisation] = useState("");
  const [filtreSpecialite, setFiltreSpecialite] = useState("");
  const [filtreDispo, setFiltreDispo] = useState(false);
  const [structureActive, setStructureActive] = useState(null);

  // Filtrage
  const filteredStructures = fakeStructures.filter(s => {
    const matchNom = s.nom.toLowerCase().includes(search.toLowerCase());
    const matchLoc = !filtreLocalisation || s.localisation === filtreLocalisation;
    const matchSpe = !filtreSpecialite || s.specialites.includes(filtreSpecialite);
    const matchDispo = !filtreDispo || s.medecins.some(m => m.disponible);
    return matchNom && matchLoc && matchSpe && matchDispo;
  });

  return (
    <div style={{ background: "#f0f9ff", minHeight: "100vh", padding: "0 0 4rem 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1rem" }}>
        {/* En-tête */}
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#2563eb", marginBottom: "0.5rem" }}>
          Structures Médicales
        </h1>
        <p style={{ color: "#059669", fontWeight: 500, marginBottom: "2rem" }}>
          Parcourez les établissements partenaires et choisissez où demander un chat ou une téléconsultation.
        </p>

        {/* Barre de recherche et filtres */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          <input
            type="text"
            placeholder="Rechercher une structure..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 2,
              border: "1px solid #bae6fd",
              borderRadius: "0.75rem",
              padding: "0.7rem 1rem",
              background: "#fff",
              fontSize: "1rem"
            }}
          />
          <select
            value={filtreLocalisation}
            onChange={e => setFiltreLocalisation(e.target.value)}
            style={{
              flex: 1,
              border: "1px solid #bae6fd",
              borderRadius: "0.75rem",
              padding: "0.7rem 1rem",
              background: "#fff",
              fontSize: "1rem"
            }}
          >
            <option value="">Toutes les villes</option>
            {allLocalisations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <select
            value={filtreSpecialite}
            onChange={e => setFiltreSpecialite(e.target.value)}
            style={{
              flex: 1,
              border: "1px solid #bae6fd",
              borderRadius: "0.75rem",
              padding: "0.7rem 1rem",
              background: "#fff",
              fontSize: "1rem"
            }}
          >
            <option value="">Toutes spécialités</option>
            {allSpecialites.map(spe => (
              <option key={spe} value={spe}>{spe}</option>
            ))}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500, color: "#2563eb" }}>
            <input
              type="checkbox"
              checked={filtreDispo}
              onChange={e => setFiltreDispo(e.target.checked)}
              style={{ accentColor: "#059669" }}
            />
            Médecins disponibles
          </label>
        </div>

        {/* Liste ou grille de structures */}
        {!structureActive ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2rem"
          }}>
            {filteredStructures.length === 0 && (
              <div style={{
                gridColumn: "1/-1",
                textAlign: "center",
                color: "#888",
                fontWeight: 500,
                fontSize: "1.1rem"
              }}>
                Aucune structure trouvée.
              </div>
            )}
            {filteredStructures.map(s => (
              <div key={s.id} style={{
                background: "#fff",
                borderRadius: "1.2rem",
                boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
                padding: "2rem 1.2rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.7rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <FaHospital style={{ color: "#2563eb", fontSize: 22 }} />
                  <span style={{ fontWeight: 700, fontSize: "1.2rem", color: "#2563eb" }}>{s.nom}</span>
                </div>
                <div style={{ color: "#059669", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                  <FaMapMarkerAlt /> {s.localisation}
                </div>
                <div style={{ color: "#2563eb", fontWeight: 500, fontSize: "1rem" }}>
                  Spécialités : {s.specialites.join(", ")}
                </div>
                <div style={{ color: "#059669", fontWeight: 500 }}>
                  <FaUserMd /> {s.medecins.length} médecin(s)
                </div>
                <button
                  style={{
                    marginTop: "1rem",
                    background: "linear-gradient(90deg, #34d399 0%, #2563eb 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0.75rem",
                    padding: "0.7rem 0",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                  onClick={() => setStructureActive(s)}
                >
                  Consulter
                </button>
              </div>
            ))}
          </div>
        ) : (
          // Vue détail structure
          <div style={{
            background: "#fff",
            borderRadius: "1.2rem",
            boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
            padding: "2.5rem 2rem",
            marginTop: "2rem",
            maxWidth: 600,
            marginLeft: "auto",
            marginRight: "auto"
          }}>
            <button
              onClick={() => setStructureActive(null)}
              style={{
                marginBottom: "1.5rem",
                color: "#2563eb",
                background: "none",
                border: "none",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              ← Retour à la liste
            </button>
            <h2 style={{ fontWeight: 800, fontSize: "1.5rem", color: "#2563eb", marginBottom: 8 }}>
              {structureActive.nom}
            </h2>
            <div style={{ color: "#059669", fontWeight: 500, marginBottom: 6 }}>
              <FaMapMarkerAlt /> {structureActive.localisation}
            </div>
            <div style={{ color: "#2563eb", fontWeight: 500, marginBottom: 6 }}>
              Spécialités : {structureActive.specialites.join(", ")}
            </div>
            <div style={{ color: "#059669", fontWeight: 500, marginBottom: 18 }}>
              <FaUserMd /> {structureActive.medecins.length} médecin(s)
            </div>
            <div style={{ fontWeight: 700, color: "#2563eb", marginBottom: 10 }}>
              Médecins de la structure :
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 18 }}>
              {structureActive.medecins.map(m => (
                <li key={m.id} style={{
                  background: "#f0f9ff",
                  borderRadius: "0.7rem",
                  padding: "0.7rem 1rem",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontWeight: 500
                }}>
                  <FaUserMd style={{ color: "#2563eb" }} />
                  <span>{m.nom}</span>
                  <span style={{ color: "#059669" }}>{m.specialite}</span>
                  {m.disponible ? (
                    <span style={{ color: "#34d399", display: "flex", alignItems: "center", gap: 4 }}>
                      <FaCheckCircle /> Disponible
                    </span>
                  ) : (
                    <span style={{ color: "#e53e3e" }}>Indisponible</span>
                  )}
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: 10 }}>
              <button
                style={{
                  background: "#38b6ff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.75rem",
                  padding: "0.7rem 1.5rem",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
                onClick={() => window.location.href = "/chatAI"}
              >
                <FaComments style={{ marginRight: 6 }} /> Démarrer un chat
              </button>
              <button
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.75rem",
                  padding: "0.7rem 1.5rem",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
                onClick={() => window.location.href = "/tv_consuting"}
              >
                <FaCalendarAlt style={{ marginRight: 6 }} /> Prendre un rendez-vous
              </button>
              <button
                style={{
                  background: "#059669",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.75rem",
                  padding: "0.7rem 1.5rem",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
                onClick={() => alert("Structure choisie pour votre suivi !")}
              >
                <FaStethoscope style={{ marginRight: 6 }} /> Choisir cette structure
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}