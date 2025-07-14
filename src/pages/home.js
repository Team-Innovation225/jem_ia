import React from "react";
import { Link } from "react-router-dom";
import {
  FaHeartbeat, FaUserMd, FaShieldAlt, FaComments,
  FaPrescriptionBottleAlt, FaCloudUploadAlt, FaLock, FaFacebook, FaTwitter, FaLinkedin, FaStethoscope, FaUser
} from "react-icons/fa";

const colors = {
  bleu: "#2e7dff",
  bleuCiel: "#e0eafc",
  bleuMarrine: "#1a73e8",
  blanc: "#fff",
  gris: "#f7f7f8",
  grisFonce: "#e0eafc",
  texte: "#222",
  accent: "#38b6ff",
};

const styles = {
  root: {
    fontFamily: "Segoe UI, Arial, sans-serif",
    background: colors.gris,
    minHeight: "100vh",
    margin: 0,
    padding: 0,
  },
  header: {
    background: colors.blanc,
    boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
    padding: "1.2rem 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  logo: {
    fontWeight: 800,
    fontSize: "2rem",
    color: colors.bleu,
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    letterSpacing: "1px",
  },
  nav: {
    display: "flex",
    gap: "2rem",
    fontSize: "1.08rem",
  },
  navLink: {
    color: colors.texte,
    textDecoration: "none",
    fontWeight: 600,
    transition: "color 0.2s",
    cursor: "pointer",
  },
  hero: {
    background: "linear-gradient(120deg, #e0eafc 60%, #f7f7f8 100%)",
    padding: "3.5rem 0 2.5rem 0",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2.5rem",
  },
  heroTitle: {
    fontSize: "2.5rem",
    fontWeight: 800,
    color: colors.bleu,
    marginBottom: "1.2rem",
    letterSpacing: "1px",
  },
  heroSlogan: {
    fontSize: "1.3rem",
    color: "#333",
    marginBottom: "2rem",
    fontWeight: 500,
  },
  heroBtns: {
    display: "flex",
    gap: "1.2rem",
    justifyContent: "center",
    marginBottom: "2.5rem",
  },
  heroBtn: {
    background: colors.bleu,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "1rem 2.2rem",
    fontWeight: 700,
    fontSize: "1.1rem",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(46,125,255,0.08)",
    transition: "background 0.2s",
  },
  heroBtnStruct: {
    background: colors.vertDoux,
    color: colors.bleu,
    border: "none",
    borderRadius: "8px",
    padding: "1rem 2.2rem",
    fontWeight: 700,
    fontSize: "1.1rem",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(46,125,255,0.08)",
    transition: "background 0.2s",
  },
  heroImg: {
    width: "340px",
    maxWidth: "90vw",
    borderRadius: "18px",
    boxShadow: "0 4px 24px rgba(46,125,255,0.10)",
    margin: "0 auto",
  },
  section: {
    maxWidth: "1100px",
    margin: "3rem auto",
    background: colors.blanc,
    borderRadius: "16px",
    boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
    padding: "2.5rem 2rem",
    marginBottom: "2.5rem",
  },
  sectionTitle: {
    fontWeight: 800,
    color: colors.bleu,
    fontSize: "1.5rem",
    marginBottom: "1.2rem",
    textAlign: "center",
    letterSpacing: "1px",
  },
  avantages: {
    display: "flex",
    flexWrap: "wrap",
    gap: "2.5rem",
    justifyContent: "center",
    marginTop: "2rem",
  },
  avantageCard: {
    background: colors.gris,
    borderRadius: "12px",
    padding: "1.5rem 1.2rem",
    minWidth: "220px",
    maxWidth: "270px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(46,125,255,0.04)",
    fontSize: "1.08rem",
    color: colors.texte,
    fontWeight: 500,
  },
  avantageIcon: {
    fontSize: "2.2rem",
    color: colors.bleu,
    marginBottom: "0.7rem",
  },
  features: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "2rem",
    marginTop: "2.5rem",
  },
  featureCard: {
    background: colors.gris,
    borderRadius: "12px",
    padding: "1.5rem 1.2rem",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(46,125,255,0.04)",
    fontSize: "1.08rem",
    color: colors.texte,
    fontWeight: 500,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
  },
  featureIcon: {
    fontSize: "2.2rem",
    color: colors.bleu,
  },
  security: {
    background: "#e0eafc",
    borderRadius: "12px",
    padding: "2rem 1.5rem",
    margin: "2rem 0",
    textAlign: "center",
    color: colors.texte,
    fontWeight: 500,
    fontSize: "1.08rem",
    boxShadow: "0 2px 8px rgba(46,125,255,0.04)",
  },
  footer: {
    background: colors.bleu,
    color: "#fff",
    padding: "2.2rem 0 1.2rem 0",
    marginTop: "3rem",
  },
  footerContent: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "2rem",
  },
  footerLinks: {
    display: "flex",
    flexDirection: "column",
    gap: "0.7rem",
    fontSize: "1.05rem",
  },
  footerLink: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: 500,
    opacity: 0.9,
    transition: "opacity 0.2s",
  },
  social: {
    display: "flex",
    gap: "1.2rem",
    marginTop: "1rem",
  },
  copyright: {
    textAlign: "center",
    color: "#e0eafc",
    fontSize: "0.98rem",
    marginTop: "1.5rem",
    opacity: 0.8,
  },
};

export default function Home() {
  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <FaHeartbeat /> SantéAI
        </div>
        <nav style={styles.nav}>
          <a href="#accueil" style={styles.navLink}>Accueil</a>
          <a href="#a-propos" style={styles.navLink}>À propos</a>
          <a href="#fonctionnalites" style={styles.navLink}>Fonctionnalités</a>
          <Link to="/login" style={styles.navLink}>Connexion</Link>
          <Link to="/register" style={styles.navLink}>S’inscrire</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={styles.hero} id="accueil">
        <div style={styles.heroTitle}>Votre santé, notre priorité</div>
        <div style={styles.heroSlogan}>
          Diagnostiquez en toute simplicité grâce à l’IA
        </div>
        <div style={styles.heroBtns}>
          <Link to="/register" style={styles.heroBtn}>Créer un compte</Link>
          <Link to="/admin_form" style={styles.heroBtnStruct}>Je représente une structure</Link>
        </div>
        <img
          src="/robo.png"
          alt="Illustration médicale"
          style={styles.heroImg}
        />
      </section>

      {/* Pourquoi SantéAI */}
      <section style={styles.section} id="a-propos">
        <div style={styles.sectionTitle}>Pourquoi SantéAI&nbsp;?</div>
        <div style={styles.avantages}>
          <div style={styles.avantageCard}>
            <div style={styles.avantageIcon}><FaHeartbeat /></div>
            Rapidité des diagnostics
          </div>
          <div style={styles.avantageCard}>
            <div style={styles.avantageIcon}><FaUserMd /></div>
            Fiabilité basée sur l’IA
          </div>
          <div style={styles.avantageCard}>
            <div style={styles.avantageIcon}><FaShieldAlt /></div>
            Confidentialité des données
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section style={styles.section} id="fonctionnalites">
        <div style={styles.sectionTitle}>Fonctionnalités clés</div>
        <div style={styles.features}>
          <div style={styles.featureCard}>
            <FaStethoscope style={styles.featureIcon} />
            Diagnostic médical par IA
          </div>
          <div style={styles.featureCard}>
            <FaUser style={styles.featureIcon} />
            Suivi personnalisé du patient
          </div>
          <div style={styles.featureCard}>
            <FaPrescriptionBottleAlt style={styles.featureIcon} />
            Ordonnances intelligentes
          </div>
          <div style={styles.featureCard}>
            <FaComments style={styles.featureIcon} />
            Téléconsultation / Messagerie
          </div>
          <div style={styles.featureCard}>
            <FaCloudUploadAlt style={styles.featureIcon} />
            Téléversement de documents médicaux
          </div>
        </div>
      </section>

      {/* Sécurité et confidentialité */}
      <section style={styles.security}>
        <div style={{ fontWeight: 700, color: colors.bleu, fontSize: "1.15rem", marginBottom: "0.7rem" }}>
          <FaLock /> Sécurité &amp; Confidentialité
        </div>
        <div>
          Respect des normes RGPD et de confidentialité médicale.<br />
          Aucune exploitation des données sans consentement.
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: "1rem" }}>SantéAI</div>
            <div style={styles.social}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: "#fff" }}><FaFacebook size={22} /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: "#fff" }}><FaTwitter size={22} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: "#fff" }}><FaLinkedin size={22} /></a>
            </div>
          </div>
          <div style={styles.footerLinks}>
            <a href="#accueil" style={styles.footerLink}>Accueil</a>
            <a href="#a-propos" style={styles.footerLink}>À propos</a>
            <a href="#fonctionnalites" style={styles.footerLink}>Fonctionnalités</a>
            <a href="/contact" style={styles.footerLink}>Contact</a>
            <a href="/cgu" style={styles.footerLink}>CGU</a>
            <a href="/confidentialite" style={styles.footerLink}>Politique de confidentialité</a>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: "0.7rem" }}>Contact</div>
            <div>support@santeai.com</div>
          </div>
        </div>
        <div style={styles.copyright}>
          © {new Date().getFullYear()} SantéAI. Tous droits reservés.
        </div>
      </footer>
    </div>
  );
}

