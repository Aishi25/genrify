from pydantic import BaseModel, ConfigDict, Field


class PredictRequest(BaseModel):
    model_config = ConfigDict(extra="____") # what should happen to fields we did not ask for? ("ignore", "allow", or "forbid"?)

    danceability: float = Field(ge=0.0, le=1.0) # ge = "greater than or equal", le = "less than or equal" 0 - what do you think these mean?

    energy: ____ = Field(ge=0.0, le=____) # energy should be a value from what to what?

    # consider what type each one should be - int, float or bool? what should the upper and lower bound be?
    key: ____ = Field(ge=-1, le=11, description="Pitch class 0-11; -1 if undetected.") 
    loudness: ____ = Field(ge=-60.0, le=5.0, description="Decibels.")
    mode: ____ = Field(ge=0, le=1, description="1 major, 0 minor.")
    speechiness: ____ = Field(ge=0.0, le=1.0)
    acousticness: float = Field(ge=____, le=1.0)
    instrumentalness: ____ = Field(ge=0.0, le=1.0)
    liveness: ____ = Field(ge=0.0, le=1.0)
    valence: ____ = Field(ge=____, le=1.0)
    tempo: float = Field(ge=0.0, le=____, description="Beats per minute.") # API allows up to 250 BPM
    time_signature: ____ = Field(ge=0, le=7)
    duration_ms: ____ = Field(gt=0, le=6_000_000)
    popularity: ____ = Field(ge=0, le=100)
    explicit: ____
