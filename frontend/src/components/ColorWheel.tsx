import React, { useEffect, useRef, useState } from 'react';
import { type Block } from '../api';

interface ColorWheelProps {
  blocks: Block[];
  onSelect: (block: Block) => void;
  selectedStart?: Block;
  selectedEnd?: Block;
}

const ColorWheel: React.FC<ColorWheelProps> = ({ blocks, onSelect, selectedStart, selectedEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lightness, setLightness] = useState(50);
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  };

  // Pre-load images
  useEffect(() => {
    const loadedImages: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;
    const total = blocks.length;

    if (total === 0) return;

    blocks.forEach(block => {
      const img = new Image();
      img.src = `/textures/${block.id}`;
      img.onload = () => {
        loadedImages[block.id] = img;
        loadedCount++;
        if (loadedCount === total) {
          setImages(loadedImages);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === total) {
          setImages(loadedImages);
        }
      };
    });
  }, [blocks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 30;

    ctx.clearRect(0, 0, width, height);

    // Draw background wheel (gradient)
    for (let angle = 0; angle < 360; angle++) {
      // Shift by -90 degrees to put Hue 0 (Red) at the top
      const startAngle = (angle - 0.5 - 90) * Math.PI / 180;
      const endAngle = (angle + 0.5 - 90) * Math.PI / 180;
      
      const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      grad.addColorStop(0, `hsl(${angle}, 0%, ${lightness}%)`);
      grad.addColorStop(1, `hsl(${angle}, 100%, ${lightness}%)`);
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Plot blocks
    blocks.forEach(block => {
      const [h, s, l] = rgbToHsl(block.rgb[0], block.rgb[1], block.rgb[2]);
      
      // Only show blocks near current lightness
      const lightnessDiff = Math.abs(l - lightness);
      if (lightnessDiff > 15) return;

      const angleRad = (h - 90) * Math.PI / 180;
      const dist = (s / 100) * radius;
      const x = centerX + dist * Math.cos(angleRad);
      const y = centerY + dist * Math.sin(angleRad);

      const img = images[block.id];
      const size = 16;

      if (img) {
        ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = block.hex;
        ctx.fill();
      }
      
      if (block.id === selectedStart?.id || block.id === selectedEnd?.id) {
        ctx.strokeStyle = block.id === selectedStart?.id ? '#fbbf24' : '#60a5fa';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - (size + 4) / 2, y - (size + 4) / 2, size + 4, size + 4);
      }
    });
  }, [blocks, lightness, selectedStart, selectedEnd, images]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    let closestBlock: Block | null = null;
    let minDist = 15;

    blocks.forEach(block => {
      const [h, s, l] = rgbToHsl(block.rgb[0], block.rgb[1], block.rgb[2]);
      if (Math.abs(l - lightness) > 15) return;

      const angleRad = (h - 90) * Math.PI / 180;
      const dist = (s / 100) * radius;
      const bx = centerX + dist * Math.cos(angleRad);
      const by = centerY + dist * Math.sin(angleRad);

      const d = Math.sqrt((x - bx) ** 2 + (y - by) ** 2);
      if (d < minDist) {
        minDist = d;
        closestBlock = block;
      }
    });

    if (closestBlock) {
      onSelect(closestBlock);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 bg-slate-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold">Colour Wheel</h2>
      <canvas 
        ref={canvasRef} 
        width={500} 
        height={500} 
        onClick={handleCanvasClick}
        className="cursor-crosshair rounded-full bg-slate-900 shadow-inner"
      />
      <div className="w-full max-w-xs">
        <label className="block text-sm font-medium mb-2">Lightness Filter: {Math.round(lightness)}%</label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={lightness} 
          onChange={(e) => setLightness(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>
      <p className="text-xs text-slate-400">Showing blocks within ±15% lightness</p>
    </div>
  );
};

export default ColorWheel;
