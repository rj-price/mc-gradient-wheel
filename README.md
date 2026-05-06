# Minecraft Gradient & Colour Wheel

A web-based tool for Minecraft builders to find the perfect block gradients.

## Features
- **CIELAB Color Mapping:** Blocks are mapped to a 2D wheel based on perceived color, not just RGB values.
- **K-Means Dominant Color Extraction:** Automatically finds the most significant color in a block's texture.
- **Shortest-Path Gradients:** Calculates the smoothest transition between two blocks through the CIELAB color space.
- **Lightness Filtering:** Easily find blocks that match a specific brightness level.

## How to Run

1. **Add Textures:**
   Place your Minecraft `.png` block textures in the `./textures` directory.

2. **Launch with Docker Compose:**
   ```bash
   docker compose up -d --build
   ```

3. **Access the App:**
   - Frontend: [http://localhost:3020](http://localhost:3020)
   - Backend API: [http://localhost:8000](http://localhost:8000)

## Technical Stack
- **Backend:** FastAPI, Pillow, scikit-learn, scikit-image
- **Frontend:** React, TypeScript, TailwindCSS, HTML5 Canvas
- **Deployment:** Docker & Docker Compose
