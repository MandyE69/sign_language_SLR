# app/utils.py
import numpy as np

def preprocess(features: list[float]) -> np.ndarray:
    arr = np.array(features, dtype=np.float32)

    # replicate any scaling / padding you applied during training
    # e.g. arr = (arr - mean) / std

    return arr.reshape(1, -1)
