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

# Montage des fichiers statiques
if not os.path.exists("static"):
    os.makedirs("static")
app.mount("/static", StaticFiles(directory="static"), name="static")

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
