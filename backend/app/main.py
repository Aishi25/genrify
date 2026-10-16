from fastapi import FastAPI

from .schemas import PredictRequest

app = FastAPI(title="Genrify Genre API", version="0.1.0")

@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "source": "mock"}

@app.post("/predict", tags=["prediction"]) # POST: the client is sending data (a song's features) to the server. GET is for fetching and has no request body
def predict(payload: PredictRequest): # PredictRequest: FastAPI reads the JSON body, checks it against that class, and only calls this function if it passes. otherwise it replies 422 automatically
    return {
        "genre": "pop", # any one of "acoustic", "edm", "hip-hop", "pop", "rock". hardcoded for now; the real model will choose it later
        "confidence": 0.5, # the probability of the genre above. always between 0 and 1, and must equal that genre's entry below
        "probabilities": {
            "acoustic": 0.1, "edm": 0.1, "hip-hop": 0.15, "pop": 0.5, "rock": 0.15 # pop is 0.5 to match confidence. all five must add up to 1 (0.1 + 0.1 + 0.15 + 0.5 + 0.15), because exactly one genre is right
        },
        "source": "mock" # we're returning a mock response for now. "model" is reserved for the real classifier
    }
