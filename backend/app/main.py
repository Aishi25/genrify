from fastapi import FastAPI

from .schemas import PredictRequest

app = FastAPI(title="Genrify Genre API", version="0.1.0")

@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "source": "mock"}

@app.____("/predict", tags=["prediction"]) # which HTTP method should sending a prediction to the server be?
def predict(payload: ____): # what type should payload be? (hint: the class in schemas.py)
    return {
        "genre": "____", # pick any one of the genres - "acoustic", "edm", "hip-hop", "pop", "rock". this will later be the predicted one
        "confidence": ____, # the probability of your genre. what two values should this be between?
        "probabilities": {
            "acoustic": 0.1, "edm": 0.1, "hip-hop": 0.15, "pop": ____, "rock": 0.15 # what should this be? what should all values add to?
        },
        "source": "mock" # we're returning a mock response for now
    }
