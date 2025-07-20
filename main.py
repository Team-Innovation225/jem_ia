import logging
from fastapi import FastAPI, Request, Response, Depends, HTTPException, status
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

from app.base_de_donnees.connexion import init_db
from app.configuration.parametres import parametres
from app.services.gestionnaire_authentification import GestionnaireAuthentification
from app.base_de_donnees.modeles import UserEnDB

# Importation des fonctions d'initialisation depuis injection.py
from app.dependances.injection import (
    init_integrateur_llm_instance,
    init_gestionnaire_connaissances_instance,
    init_gestionnaire_contexte_instance,
    init_gestionnaire_vocal_instance,
    init_gestionnaire_authentification_instance,
    init_moteur_diagnostic_instance,
    init_gestionnaire_patient_instance,
    init_gestionnaire_medecin_instance,
    init_gestionnaire_structure_medicale_instance,
    init_gestionnaire_rendezvous_instance,
    init_gestionnaire_telemedecine_instance,
    init_gestionnaire_geolocalisation_instance
)

# Importation des routeurs d'API
from app.api.v1 import (
    authentification_router,
    points_terminaux_router,
    teleassistance_router,
    patient_router,
    medecin_router,
    structure_medicale_router,
    rendez_vous_router,
    telemedecine_router_v2,
    geolocalisation_router
)

# Configuration du logging
logging.basicConfig(level=parametres.LOG_LEVEL, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialisation de la base de données au démarrage de l'application
init_db()

app = FastAPI(
    title="API Télémédecine IA",
    description="API pour une plateforme de télémédecine intégrant l'IA pour l'assistance au diagnostic et la gestion des patients.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Configuration CORS
origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8000",
    "https://98db353b388d.ngrok-free.app",
    "https://355c4045654e.ngrok-free.app",
    "172.16.1.178:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Authorization"],
)

# Créer les répertoires "templates" et "static" si non existants.
if not os.path.exists("templates"):
    os.makedirs("templates")
if not os.path.exists("static"):
    os.makedirs("static")

templates = Jinja2Templates(directory="templates")

# Montage des fichiers statiques (CSS, JS, Images)
app.mount("/static", StaticFiles(directory="static"), name="static")

# --- FONCTION D'INITIALISATION AU DÉMARRAGE ---
@app.on_event("startup")
async def startup_event():
    logger.info("Démarrage de l'application : Initialisation des services...")
    # Initialisation des services dans un ordre qui respecte les dépendances
    await init_integrateur_llm_instance()
    await init_gestionnaire_connaissances_instance()
    await init_gestionnaire_contexte_instance()
    await init_gestionnaire_vocal_instance()
    await init_moteur_diagnostic_instance() 
    await init_gestionnaire_authentification_instance() 
    await init_gestionnaire_patient_instance() 
    await init_gestionnaire_medecin_instance() 
    await init_gestionnaire_structure_medicale_instance() 
    await init_gestionnaire_rendezvous_instance() 
    await init_gestionnaire_telemedecine_instance() 
    await init_gestionnaire_geolocalisation_instance() 
    logger.info("Tous les services ont été initialisés.")
# --- FIN DE LA FONCTION D'INITIALISATION ---

# --- DÉPENDANCE POUR PROTÉGER LES ROUTES DU TABLEAU DE BORD ---
# Cette dépendance s'assure que seul un utilisateur authentifié peut accéder à la page.
async def get_current_active_user_for_dashboard(
    current_user: UserEnDB = Depends(GestionnaireAuthentification.get_current_active_user)
) -> UserEnDB:
    """
    Dépendance pour obtenir l'utilisateur actif et protéger la route du tableau de bord.
    """
    return current_user

# --- DÉFINITION DES ROUTES HTML ---

# Route racine pour servir la page de connexion (login.html)
@app.get("/", response_class=HTMLResponse, summary="Page de connexion")
async def read_login_root(request: Request):
    """
    Sert la page de connexion de l'application (login.html).
    """
    return templates.TemplateResponse("login.html", {"request": request})

# Route pour servir le tableau de bord (dashboard.html), protégée par authentification
@app.get("/dashboard", response_class=HTMLResponse, summary="Tableau de bord de l'application")
async def read_dashboard(
    request: Request,
    current_user: UserEnDB = Depends(get_current_active_user_for_dashboard) # Protection de la route
):
    """
    Sert la page du tableau de bord de l'application (dashboard.html).
    Requiert une authentification.
    """
    # Si l'utilisateur est authentifié, il peut accéder au tableau de bord
    return templates.TemplateResponse("dashboard.html", {"request": request, "user": current_user})


# Enregistrement des routeurs d'API
app.include_router(authentification_router, prefix="/api/v1/auth", tags=["Authentification"])
app.include_router(points_terminaux_router, prefix="/api/v1/core", tags=["Core IA & Connaissances"])
app.include_router(teleassistance_router, prefix="/api/v1/teleassistance", tags=["Téléassistance"])
app.include_router(patient_router, prefix="/api/v1/patients", tags=["Gestion Patients"])
app.include_router(medecin_router, prefix="/api/v1/medecins", tags=["Gestion Médecins"])
app.include_router(structure_medicale_router, prefix="/api/v1/structures", tags=["Gestion Structures Médicales"])
app.include_router(rendez_vous_router, prefix="/api/v1/appointments", tags=["Rendez-vous"])
app.include_router(telemedecine_router_v2, prefix="/api/v1/telemedecine", tags=["Télémedecine V2"])
app.include_router(geolocalisation_router, prefix="/api/v1/geolocation", tags=["Géolocalisation"])

@app.get("/api/v1/protected-test", summary="Test de route protégée")
async def protected_test(current_user: UserEnDB = Depends(GestionnaireAuthentification.get_current_active_user)):
    """
    Une route de test qui nécessite une authentification via Firebase ID Token.
    """
    return {"message": f"Accès autorisé pour l'utilisateur: {current_user.email} avec le rôle: {current_user.role}", "firebase_uid": current_user.firebase_uid}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
