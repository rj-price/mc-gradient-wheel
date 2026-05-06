import React from 'react';
import { type Block } from '../api';

interface GradientDisplayProps {
  gradient: Block[];
  onRemove?: (index: number) => void;
}

const GradientDisplay: React.FC<GradientDisplayProps> = ({ gradient }) => {
  if (gradient.length === 0) return null;

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg w-full">
      <h2 className="text-xl font-bold mb-4">Generated Gradient</h2>
      <div className="flex flex-wrap gap-4 items-center justify-center">
        {gradient.map((block, index) => (
          <div key={`${block.id}-${index}`} className="flex flex-col items-center group relative">
            <div 
              className="w-16 h-16 rounded-md shadow-md border-2 border-slate-700 overflow-hidden relative"
              style={{ backgroundColor: block.hex }}
            >
              {/* Fallback texture path - assuming static assets in public/textures */}
              <img 
                src={`/textures/${block.id}`} 
                alt={block.name}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
            <span className="text-xs mt-2 text-slate-300 w-16 text-center truncate" title={block.name}>
              {block.name}
            </span>
            
            {index < gradient.length - 1 && (
              <div className="absolute -right-3 top-6 text-slate-500">
                →
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-slate-900 rounded-lg">
        <h3 className="text-sm font-semibold mb-2 text-indigo-400">Palette IDs:</h3>
        <code className="text-xs break-all text-slate-400">
          {gradient.map(b => b.id.replace('.png', '')).join(', ')}
        </code>
      </div>
    </div>
  );
};

export default GradientDisplay;
