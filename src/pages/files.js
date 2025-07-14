import React, { useRef, useState } from "react";
import { FaTimes, FaUpload, FaFileMedical, FaFilePdf, FaFileAlt } from "react-icons/fa";

function formatBytes(bytes) {
  if (bytes === 0) return "0 o";
  const k = 1024;
  const sizes = ["o", "Ko", "Mo", "Go"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(type) {
  if (type.includes("pdf")) return <FaFilePdf color="#e53e3e" size={32} />;
  if (type.includes("image")) return <FaFileMedical color="#38b6ff" size={32} />;
  return <FaFileAlt color="#2563eb" size={32} />;
}

export default function Files({ onClose }) {
  const fileInputRef = useRef();
  const [files, setFiles] = useState([]);

  const handleImport = (e) => {
    const newFiles = Array.from(e.target.files).map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      date: new Date(),
      file,
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.18)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "2rem",
        boxShadow: "0 12px 48px 0 rgba(46,125,255,0.15)",
        width: 700,
        maxWidth: "98vw",
        minHeight: 520,
        padding: "2.5rem 2.5rem 5.5rem 2.5rem",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        animation: "fadeIn .25s",
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 22,
            right: 22,
            background: "#f0f9ff",
            border: "none",
            borderRadius: "50%",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#2563eb",
            fontSize: 20,
            boxShadow: "0 1px 6px rgba(46,125,255,0.07)"
          }}
          aria-label="Fermer"
        >
          <FaTimes />
        </button>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "1.7rem"
        }}>
          <FaFileMedical size={54} color="#38b6ff" style={{ marginBottom: 14 }} />
          <h2 style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "#2563eb",
            margin: 0,
            textAlign: "center"
          }}>
            Dossiers médicaux du patient
          </h2>
          <p style={{
            color: "#64748b",
            fontWeight: 500,
            fontSize: "1.08rem",
            margin: "0.8rem 0 0 0",
            textAlign: "center"
          }}>
            Importez, visualisez et organisez les documents médicaux du patient ici.<br />
            Formats acceptés : PDF, images, documents.
          </p>
        </div>
        {/* Liste des fichiers */}
        <div style={{
          flex: 1,
          width: "100%",
          minHeight: 120,
          background: "#f8fafc",
          borderRadius: "1.2rem",
          border: "1px solid #e0eafc",
          padding: "1.2rem",
          marginBottom: "1.7rem",
          overflowY: "auto",
          display: "flex",
          flexWrap: "wrap",
          gap: "1.2rem",
          justifyContent: files.length ? "flex-start" : "center",
          alignItems: files.length ? "flex-start" : "center"
        }}>
          {files.length === 0 ? (
            <span style={{ color: "#94a3b8", fontSize: "1.08rem" }}>
              Aucun dossier importé pour l’instant.
            </span>
          ) : (
            files.map((f, idx) => (
              <div key={idx} style={{
                background: "#fff",
                borderRadius: "1rem",
                boxShadow: "0 2px 8px rgba(46,125,255,0.07)",
                border: "1px solid #e0eafc",
                padding: "1rem 1.2rem",
                minWidth: 180,
                maxWidth: 220,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.7rem",
                position: "relative"
              }}>
                <div>{getFileIcon(f.type)}</div>
                <div style={{
                  fontWeight: 700,
                  color: "#2563eb",
                  fontSize: "1.07rem",
                  textAlign: "center",
                  wordBreak: "break-all"
                }}>{f.name}</div>
                <div style={{
                  color: "#64748b",
                  fontSize: "0.97rem",
                  marginBottom: 2
                }}>{formatBytes(f.size)}</div>
                <div style={{
                  color: "#a0aec0",
                  fontSize: "0.85rem"
                }}>
                  {f.date.toLocaleDateString()} {f.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))
          )}
        </div>
        {/* Bouton d'import en bas à droite */}
        <button
          style={{
            position: "absolute",
            right: 38,
            bottom: 38,
            background: "linear-gradient(90deg, #34d399 0%, #2563eb 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 64,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            boxShadow: "0 2px 12px rgba(46,125,255,0.13)",
            cursor: "pointer",
            zIndex: 2
          }}
          onClick={() => fileInputRef.current.click()}
          aria-label="Importer un dossier"
        >
          <FaUpload />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={handleImport}
        />
      </div>
    </div>
  );
}