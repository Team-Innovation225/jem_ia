# app/configuration/intergiciels.py
import logging
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

# Récupérer le logger configuré (nous le configurerons plus en détail plus tard)
logger = logging.getLogger("uvicorn.error") # Ou un logger plus spécifique si vous en créez un dans journalisation.py

async def gestion_erreurs_globales(request: Request, call_next):
    """
    Intergiciel pour gérer les erreurs globales de l'application.
    Capture les exceptions non gérées et renvoie une réponse JSON formatée.
    """
    try:
        response = await call_next(request)
        return response
    except Exception as exc:
        logger.exception(f"Erreur non gérée lors du traitement de la requête: {request.url} - {exc}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Une erreur interne est survenue. Veuillez réessayer plus tard.", "code": "ERR_GLOBAL_001"}
        )

async def journalisation_requetes(request: Request, call_next):
    """
    Intergiciel pour journaliser les requêtes et les réponses de l'API.
    Utile pour le débogage et l'audit.
    """
    logger.info(f"Requête entrante: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Requête sortante: {request.method} {request.url} - Statut: {response.status_code}")
    return response