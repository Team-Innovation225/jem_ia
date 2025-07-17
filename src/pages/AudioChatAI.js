import React, { useRef, useState } from "react";

export default function AudioChatAI({ onClose }) {
  const videoRef = useRef(null);
  const [started, setStarted] = useState(false);


  const handleStop = () => {
    setStarted(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    onClose();
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      background: "linear-gradient(135deg, #e0eafc 0%, #f6fafe 100%)",
      zIndex: 9999,
    }}>
      {/* Vidéo de fond */}
      <video
        ref={videoRef}
        src="/ia-back.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "50vh",
          height: "50vh",
          objectFit: "cover",
          zIndex: 0,
          borderRadius: "50%",
          // border: "8px solid #fff",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 2px 24px #2563eb33",
        }}
      />

      {/* Titre en haut à gauche */}
      <div style={{
        position: "absolute",
        top: 32,
        left: 32,
        fontWeight: 700,
        fontSize: "1.25rem",
        color: "#2563eb",
        letterSpacing: 1,
        zIndex: 2,
      }}>
        Discussion vocale avec santeAI
      </div>
      {/* Boutons en bas */}
      <div style={{
        position: "absolute",
        bottom: 40,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "2rem",
        zIndex: 2,
      }}>
        <button
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "black",
            border: "2px solid #fff",
            borderRadius: "2rem",
            padding: "0.8rem 2.2rem",
            fontWeight: 600,
            fontSize: "1.15rem",
            cursor: "pointer",
            boxShadow: "0 2px 12px #2563eb33",
            backdropFilter: "blur(2px)",
          }}
          onClick={handleStop}
          disabled={!started}
        >
          Arrêter l'appel
        </button>
      </div>

      {/* Bouton pour fermer/revenir */}
      <button
        style={{
          position: "absolute",
          top: 32,
          right: 32,
          background: "#e0eafc",
          color: "#2563eb",
          border: "none",
          borderRadius: "1rem",
          padding: "0.5rem 1.2rem",
          fontWeight: 600,
          fontSize: "1.08rem",
          cursor: "pointer",
          boxShadow: "0 2px 8px #3b82f633",
          zIndex: 2,
        }}
        onClick={onClose}
      >
        Fermer
      </button>
    </div>
  );
}