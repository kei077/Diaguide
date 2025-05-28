from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from enum import Enum
import os
from pathlib import Path
import json
from typing import Dict, List
from datetime import datetime
import logging
from groq import Groq
import chromadb
import torch
from chromadb.config import Settings
from chromadb.utils import embedding_functions
from huggingface_hub import login
from fastapi.middleware.cors import CORSMiddleware
# Authentification HF (adapte le token !)
os.environ['HF_TOKEN'] = ""
login(token=os.environ['HF_TOKEN'])

# -------- CONFIG LOG --------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------- CONFIG CHEMINS --------
BASE_DIR = Path(__file__).parent
STORAGE_DIR = BASE_DIR / "storage"
THEMES_FILE = STORAGE_DIR / "themes.json"
DATA_DIR = STORAGE_DIR / "data"
CHROMA_DIR = STORAGE_DIR / "chroma_db"

for dir_path in [STORAGE_DIR, DATA_DIR, CHROMA_DIR]:
    dir_path.mkdir(exist_ok=True)

# -------- CHROMA --------
chroma_client = chromadb.PersistentClient(path=str(CHROMA_DIR), settings=Settings(allow_reset=True))

# -------- ENUM & MODELS --------
class EmbeddingModel(str, Enum):
    MINILM = "all-MiniLM-L6-v2"
    BGE_SMALL = "BAAI/bge-small-en-v1.5"
    BGE_BASE = "BAAI/bge-base-en-v1.5"

class LLMProvider(str, Enum):
    GROQ = "Groq"

class ThemeCreate(BaseModel):
    name: str
    embedding_model: EmbeddingModel

class QueryRequest(BaseModel):
    theme: str
    question: str
    llm_provider: LLMProvider
    llm_model: str
    temperature: float = 0.7
    max_tokens: int = 1000
    n_context_results: int = 3
    system_prompt: str = "Vous êtes un assistant utile."

# -------- CONFIG LLM --------
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "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")
groq_client = Groq(api_key=GROQ_API_KEY, timeout=60.0, max_retries=3) if GROQ_API_KEY else None
GROQ_MODELS = {
    "DeepSeek-Llama-70B": "deepseek-r1-distill-llama-70b",
    "Llama3-8B": "llama3-8b-8192",
    "Llama3-70B": "llama3-70b-8192"
}
chroma_collections = {}

# -------- UTILS --------
def load_themes() -> Dict[str, Dict]:
    if THEMES_FILE.exists():
        try:
            with open(THEMES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading themes: {str(e)}")
            return {}
    return {}

def save_themes(themes: Dict[str, Dict]):
    try:
        with open(THEMES_FILE, "w", encoding="utf-8") as f:
            json.dump(themes, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Error saving themes: {str(e)}")
        raise

def create_theme_dirs(theme_name: str) -> Path:
    theme_dir = DATA_DIR / theme_name
    theme_dir.mkdir(exist_ok=True, parents=True)
    return theme_dir

def get_embedding_function(model_name: str):
    try:
        if model_name == "all-MiniLM-L6-v2":
            return embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name="all-MiniLM-L6-v2"
            )
        elif model_name == "BAAI/bge-small-en-v1.5":
            return embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name="BAAI/bge-small-en-v1.5",
                device="cuda" if torch.cuda.is_available() else "cpu",
                model_kwargs={'token': os.environ['HF_TOKEN']}
            )
        elif model_name == "BAAI/bge-base-en-v1.5":
            return embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name="BAAI/bge-base-en-v1.5",
                device="cuda" if torch.cuda.is_available() else "cpu",
                model_kwargs={'token': os.environ['HF_TOKEN']}
            )
        raise ValueError(f"Modèle non supporté: {model_name}")
    except Exception as e:
        logger.error(f"Erreur initialisation embedding: {str(e)}")
        raise HTTPException(500, detail=f"Erreur modèle embedding: {str(e)}")

def get_chroma_collection(theme_name: str, embedding_model: str):
    if theme_name in chroma_collections:
        return chroma_collections[theme_name]
    try:
        embedding_fn = get_embedding_function(embedding_model)
        collection = chroma_client.get_or_create_collection(
            name=theme_name,
            embedding_function=embedding_fn,
            metadata={"hnsw:space": "cosine"}
        )
        chroma_collections[theme_name] = collection
        return collection
    except Exception as e:
        logger.error(f"Erreur ChromaDB: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur de collection Chroma: {str(e)}")

def get_context_from_chroma(theme_name: str, query: str, n_results: int = 3) -> str:
    themes = load_themes()
    if theme_name not in themes:
        raise HTTPException(status_code=404, detail="Thème non trouvé")
    try:
        collection = get_chroma_collection(
            theme_name,
            themes[theme_name]["embedding_model"]
        )
        results = collection.query(
            query_texts=[query],
            n_results=n_results,
            include=["documents", "distances"]
        )
        if not results or not results.get("documents"):
            return "Aucun contexte trouvé pour cette question."
        context_parts = []
        for doc, distance in zip(results["documents"][0], results["distances"][0]):
            similarity = 1 - distance
            context_parts.append(f"[Similarité: {similarity:.2f}]\n{doc}")
        return "\n\n".join(context_parts)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur de récupération: {str(e)}")
        return f"Erreur lors de la récupération du contexte: {str(e)}"

# -------- FASTAPI APP --------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/theme")
async def create_theme(theme: ThemeCreate):
    themes = load_themes()
    theme_name = theme.name.strip().lower().replace(" ", "_")
    if theme_name in themes:
        raise HTTPException(status_code=400, detail="Ce thème existe déjà")
    try:
        create_theme_dirs(theme_name)
        get_chroma_collection(theme_name, theme.embedding_model)
        themes[theme_name] = {
            "display_name": theme.name,
            "embedding_model": theme.embedding_model.value,
            "created_at": datetime.now().isoformat(),
            "documents": []
        }
        save_themes(themes)
        return {"status": "success", "theme": theme_name}
    except Exception as e:
        logger.error(f"Error creating theme: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/themes")
async def get_themes():
    themes = load_themes()
    return {
        "themes": [
            {
                "name": name,
                "display_name": data.get("display_name", name),
                "embedding_model": data["embedding_model"],
                "documents_count": len(data.get("documents", [])),
                "created_at": data.get("created_at")
            }
            for name, data in themes.items()
        ]
    }

@app.post("/theme/{theme_name}/upload")
async def upload_files(
    theme_name: str,
    files: List[UploadFile] = File(...)
):
    themes = load_themes()
    if theme_name not in themes:
        raise HTTPException(status_code=404, detail="Thème non trouvé")
    theme_dir = create_theme_dirs(theme_name)
    saved_files = []
    try:
        collection = get_chroma_collection(
            theme_name,
            themes[theme_name]["embedding_model"]
        )
        for file in files:
            try:
                file_path = theme_dir / file.filename
                # Save file
                with open(file_path, "wb") as f:
                    while content := await file.read(1024 * 1024):  # 1MB chunks
                        f.write(content)
                # Extract text (simple txt - pour PDF etc, il faut adapter)
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
                # Indexation
                doc_id = f"{theme_name}_{file.filename}_{datetime.now().timestamp()}"
                collection.add(
                    documents=[text],
                    metadatas=[{"source": file.filename}],
                    ids=[doc_id]
                )
                themes[theme_name]["documents"].append({
                    "name": file.filename,
                    "path": str(file_path),
                    "size": os.path.getsize(file_path),
                    "uploaded_at": datetime.now().isoformat(),
                    "chroma_id": doc_id
                })
                saved_files.append(file.filename)
            except Exception as e:
                logger.error(f"Error processing file {file.filename}: {str(e)}")
                continue
        save_themes(themes)
        return {
            "status": "success",
            "saved_files": saved_files,
            "total_documents": len(themes[theme_name]["documents"])
        }
    except Exception as e:
        logger.error(f"Error uploading files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def handle_query(query: QueryRequest):
    themes = load_themes()
    if not themes:
        logger.error("Aucun thème disponible")
        raise HTTPException(status_code=500, detail="Aucun thème configuré")
    if query.theme not in themes:
        available_themes = list(themes.keys())
        logger.error(f"Thème '{query.theme}' non trouvé. Thèmes disponibles: {available_themes}")
        raise HTTPException(
            status_code=404,
            detail={
                "error": "Thème non trouvé",
                "available_themes": available_themes
            }
        )
    try:
        try:
            context = get_context_from_chroma(
                theme_name=query.theme,
                query=query.question,
                n_results=query.n_context_results
            )
            if "Erreur" in context:
                logger.error(f"Erreur de récupération du contexte: {context}")
                raise HTTPException(status_code=500, detail=context)
        except Exception as e:
            logger.error(f"Échec récupération contexte: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Échec de la récupération du contexte: {str(e)}"
            )
        response_data = {
            "theme": query.theme,
            "model": query.llm_model,
            "provider": query.llm_provider.value,
            "context": context
        }
        if query.llm_provider == LLMProvider.GROQ:
            if not groq_client:
                logger.error("Client Groq non initialisé")
                raise HTTPException(
                    status_code=500,
                    detail="Configuration Groq manquante"
                )
            groq_model = GROQ_MODELS.get(query.llm_model)
            if not groq_model:
                available_models = list(GROQ_MODELS.keys())
                logger.error(f"Modèle Groq invalide. Reçu: {query.llm_model}. Disponibles: {available_models}")
                raise HTTPException(
                    status_code=400,
                    detail={
                        "error": "Modèle Groq non supporté",
                        "available_models": available_models
                    }
                )
            messages = [
                {"role": "system", "content": query.system_prompt},
                {"role": "user", "content": f"Contexte:\n{context}\n\nQuestion: {query.question}"}
            ]
            try:
                response = groq_client.chat.completions.create(
                    model=groq_model,
                    messages=messages,
                    temperature=query.temperature,
                    max_tokens=query.max_tokens,
                    timeout=30
                )
                answer = response.choices[0].message.content
                response_data["answer"] = answer
                response_data["usage"] = {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens
                }
            except Exception as e:
                logger.error(f"Erreur API Groq: {str(e)}", exc_info=True)
                raise HTTPException(
                    status_code=502,
                    detail=f"Erreur du service Groq: {str(e)}"
                )
        else:
            available_providers = [p.value for p in LLMProvider]
            logger.error(f"Fournisseur non supporté: {query.llm_provider}. Disponibles: {available_providers}")
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Fournisseur LLM non supporté",
                    "available_providers": available_providers
                }
            )
        return response_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur inattendue: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Erreur interne du serveur",
                "details": str(e)
            }
        )

@app.get("/models")
async def list_available_models():
    return {
        "embedding_models": [model.value for model in EmbeddingModel],
        "llm_providers": {
            "Groq": list(GROQ_MODELS.keys())
        }
    }

@app.get("/theme/{theme_name}/documents")
async def list_theme_documents(theme_name: str):
    themes = load_themes()
    if theme_name not in themes:
        raise HTTPException(404, detail="Thème non trouvé")
    return {
        "theme": theme_name,
        "documents": themes[theme_name].get("documents", [])
    }

# -------- INITIALIZE MODELS --------
def initialize_models():
    from sentence_transformers import SentenceTransformer
    models_to_load = [
        "all-MiniLM-L6-v2",
        "BAAI/bge-small-en-v1.5",
        "BAAI/bge-base-en-v1.5"
    ]
    for model_name in models_to_load:
        try:
            logger.info(f"Préchargement du modèle: {model_name}")
            SentenceTransformer(
                model_name,
                device="cuda" if torch.cuda.is_available() else "cpu",
                token=os.environ['HF_TOKEN']
            )
            logger.info(f"Modèle {model_name} chargé avec succès")
        except Exception as e:
            logger.error(f"Erreur chargement {model_name}: {str(e)}")

initialize_models()
