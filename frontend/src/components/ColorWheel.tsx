import React, { useEffect, useRef, useState } from 'react';
import { type Block } from '../api';

interface ColorWheelProps {
  blocks: Block[];
  onSelect: (block: Block) => void;
  selectedStart?: Block;
  selectedEnd?: Block;
}

const ColorWheel: React.FC<ColorWheelProps> = ({ blocks, onSelect, selectedStart, selectedEnd }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lightness, setLightness] = useState(50);
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // Parent container might have padding, so we get the content width
        const width = Math.min(containerRef.current.clientWidth, 1200);
        setDimensions({ width, height: width });
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

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
        if (loadedCount === total) setImages(loadedImages);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === total) setImages(loadedImages);
      };
    });
  }, [blocks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    ctx.clearRect(0, 0, width, height);

    // Draw background wheel (gradient)
    for (let angle = 0; angle < 360; angle++) {
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
      const lightnessDiff = Math.abs(l - lightness);
      if (lightnessDiff > 15) return;

      const angleRad = (h - 90) * Math.PI / 180;
      const dist = (s / 100) * radius;
      const x = centerX + dist * Math.cos(angleRad);
      const y = centerY + dist * Math.sin(angleRad);

      const img = images[block.id];
      const size = Math.max(12, Math.round(width / 40));

      if (img) {
        ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, size / 3, 0, Math.PI * 2);
        ctx.fillStyle = block.hex;
        ctx.fill();
      }
      
      if (block.id === selectedStart?.id || block.id === selectedEnd?.id) {
        ctx.strokeStyle = block.id === selectedStart?.id ? '#fbbf24' : '#60a5fa';
        ctx.lineWidth = width > 800 ? 4 : 2;
        ctx.strokeRect(x - (size + 4) / 2, y - (size + 4) / 2, size + 4, size + 4);
      }
    });
  }, [blocks, lightness, selectedStart, selectedEnd, images, dimensions]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    let closestBlock: Block | null = null;
    let minDist = 20;

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

    if (closestBlock) onSelect(closestBlock);
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-6 bg-slate-900/40 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl w-full">
      <div className="flex justify-between items-center w-full mb-2">
        <h2 className="text-xl font-black uppercase tracking-tighter text-slate-400">Color Spectrum</h2>
      </div>
      
      <div className="relative w-full flex justify-center">
        <canvas 
          ref={canvasRef} 
          width={dimensions.width} 
          height={dimensions.height} 
          onClick={handleCanvasClick}
          className="cursor-crosshair rounded-full shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] transition-all"
        />
      </div>

      <div className="w-full max-w-md pt-4 space-y-3">
        <div className="flex justify-between items-center px-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lightness</label>
          <span className="text-sm font-black text-indigo-400">{Math.round(lightness)}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={lightness} 
          onChange={(e) => setLightness(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
        />
      </div>
    </div>
  );
};

export default ColorWheel;
