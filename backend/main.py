from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
import numpy as np
from color_processor import ColorProcessor

app = FastAPI(title="Minecraft Color Wheel API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

TEXTURES_PATH = os.getenv("TEXTURES_PATH", "/app/assets/textures")
processor = ColorProcessor(TEXTURES_PATH)
block_catalog = []

@app.on_event("startup")
async def startup_event():
    global block_catalog
    print(f"Processing textures from {TEXTURES_PATH}...")
    block_catalog = processor.process_all_textures()
    print(f"Loaded {len(block_catalog)} blocks.")

@app.get("/api/blocks")
async def get_blocks():
    return block_catalog

@app.get("/api/gradient")
async def get_gradient(
    start_id: str, 
    end_id: str, 
    steps: int = Query(5, ge=2, le=20)
):
    start_block = next((b for b in block_catalog if b["id"] == start_id), None)
    end_block = next((b for b in block_catalog if b["id"] == end_id), None)

    if not start_block or not end_block:
        raise HTTPException(status_code=404, detail="Start or end block not found")

    start_lab = np.array(start_block["lab"])
    end_lab = np.array(end_block["lab"])

    gradient_blocks = []
    
    for i in range(steps):
        # Linear interpolation in CIELAB space
        t = i / (steps - 1)
        target_lab = start_lab + (end_lab - start_lab) * t
        
        # Find the closest block in the catalog
        closest_block = min(
            block_catalog,
            key=lambda b: np.linalg.norm(np.array(b["lab"]) - target_lab)
        )
        gradient_blocks.append(closest_block)

    return gradient_blocks

@app.get("/api/refresh")
async def refresh_catalog():
    global block_catalog
    block_catalog = processor.process_all_textures()
    return {"status": "success", "count": len(block_catalog)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
