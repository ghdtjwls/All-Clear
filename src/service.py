from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse, FileResponse
import uvicorn
import cv2
import numpy as np
import os
from .yolo_model import YOLOOnnx

# ----------------- CONFIG -----------------
MODEL_PATH = "./model/best_noise.onnx"
CLASS_NAMES = ["fire", "human", "smoke"]
SAVE_DIR = "./predictions"
os.makedirs(SAVE_DIR, exist_ok=True)

# ----------------- INIT -----------------
yolo = YOLOOnnx(MODEL_PATH, CLASS_NAMES)
app = FastAPI(title="YOLO ONNX Detection API")

# ----------------- HEALTH -----------------
@app.get("/health")
def health():
    return {"status": "ok"}

# ----------------- PREDICT -----------------
@app.post("/predict")
async def predict(file: UploadFile = File(...), conf_threshold: float = 0.5):
    # Read uploaded image
    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        return JSONResponse(status_code=400, content={"error": "Invalid image"})

    # Save temporary file
    temp_path = os.path.join(SAVE_DIR, file.filename)
    cv2.imwrite(temp_path, img)

    # Predict
    result = yolo.predict(temp_path, conf_threshold=conf_threshold, save_path=temp_path)

    return JSONResponse(content=result)

from fastapi.responses import FileResponse

@app.post("/predict_image")
async def predict_image(file: UploadFile = File(...)):
    # Read uploaded image
    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    # Save temporary file
    temp_path = os.path.join(SAVE_DIR, file.filename)
    cv2.imwrite(temp_path, img)

    # Predict and save output image
    result = yolo.predict(temp_path, save_path=temp_path)

    # Return predicted image directly
    return FileResponse(result["image_path"], media_type="image/jpeg")

if __name__ == "__main__":
    uvicorn.run("service:app", host="0.0.0.0", port=8000, reload=True)

