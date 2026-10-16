from pydantic import BaseModel, ConfigDict, Field

class PredictRequest(BaseModel):
    model_config = ConfigDict(extra="forbid") # "forbid": unknown fields get a 422. "ignore" would silently drop a typo like "danceablity", and "allow" would accept anything, e.g. a genre we should never be sent

    # types: int = whole numbers, float = decimals, bool = true / false
    # ge = "greater than or equal", le = "less than or equal", so Field(ge=0.0, le=1.0) means "at least 0 and at most 1". gt is "greater than" (0 itself is not allowed)
    # anything outside the range, or the wrong type, is rejected with a 422 before our code runs
    danceability: float = Field(ge=0.0, le=1.0)
    energy: float = Field(ge=0.0, le=1.0) # a decimal from 0.0 (calm) to 1.0 (intense)
    key: int = Field(ge=-1, le=11, description="Pitch class 0-11; -1 if undetected.") # a whole number: one of 12 notes, or -1 for "unknown"
    loudness: float = Field(ge=-60.0, le=5.0, description="Decibels.") # a decimal, mostly negative (quiet = more negative)
    mode: int = Field(ge=0, le=1, description="1 major, 0 minor.") # only two values, 0 or 1. a bool would also work, but the dataset stores it as a number
    speechiness: float = Field(ge=0.0, le=1.0)
    acousticness: float = Field(ge=0.0, le=1.0) # same 0 to 1 scale as danceability
    instrumentalness: float = Field(ge=0.0, le=1.0)
    liveness: float = Field(ge=0.0, le=1.0)
    valence: float = Field(ge=0.0, le=1.0) # 0.0 sad / negative to 1.0 happy / positive
    tempo: float = Field(ge=0.0, le=250.0, description="Beats per minute.") # API allows up to 250 BPM
    time_signature: int = Field(ge=0, le=7) # beats per bar, a whole number
    duration_ms: int = Field(gt=0, le=6_000_000) # milliseconds, a whole number. gt=0 because a song can't have zero length; 6,000,000 ms = 100 minutes
    popularity: int = Field(ge=0, le=100) # a whole-number score
    explicit: bool # true / false. no Field(...) needed because there is no range to check