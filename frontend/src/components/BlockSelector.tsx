import React, { useState } from 'react';
import { type Block } from '../api';

interface BlockSelectorProps {
  blocks: Block[];
  onSelect: (block: Block) => void;
  label: string;
  selectedBlock: Block | null;
  colorClass: string;
}

const BlockSelector: React.FC<BlockSelectorProps> = ({ blocks, onSelect, label, selectedBlock, colorClass }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredBlocks = blocks.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">{label}</label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 p-3 bg-slate-900 border-2 rounded-xl transition-all hover:bg-slate-850 ${
          isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-700 hover:border-slate-600'
        }`}
      >
        <div 
          className={`w-10 h-10 rounded-lg shadow-inner flex-shrink-0 border-2 ${selectedBlock ? colorClass : 'bg-slate-800 border-slate-700'}`}
          style={{ backgroundColor: selectedBlock?.hex }}
        >
          {selectedBlock && (
            <img 
              src={`/textures/${selectedBlock.id}`} 
              alt="" 
              className="w-full h-full object-cover rounded-[6px]"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          )}
        </div>
        <div className="flex-grow text-left">
          <p className="font-semibold text-sm truncate">
            {selectedBlock?.name || 'Select a block...'}
          </p>
          <p className="text-xs text-slate-500">
            {selectedBlock ? selectedBlock.hex.toUpperCase() : 'Click to browse'}
          </p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[400px]">
            <div className="p-3 bg-slate-900 border-b border-slate-700">
              <input
                autoFocus
                type="text"
                placeholder="Search blocks..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="overflow-y-auto p-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredBlocks.map(block => (
                <button
                  key={block.id}
                  onClick={() => {
                    onSelect(block);
                    setIsOpen(false);
                  }}
                  className={`flex flex-col items-center p-2 rounded-xl transition-all hover:bg-slate-700 group ${
                    selectedBlock?.id === block.id ? 'bg-slate-700 ring-2 ring-indigo-500' : ''
                  }`}
                >
                  <div 
                    className="w-12 h-12 rounded-lg mb-2 shadow-md border border-slate-600 overflow-hidden"
                    style={{ backgroundColor: block.hex }}
                  >
                    <img 
                      src={`/textures/${block.id}`} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                  </div>
                  <span className="text-[10px] text-center w-full truncate text-slate-400 group-hover:text-slate-100">
                    {block.name}
                  </span>
                </button>
              ))}
              {filteredBlocks.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-500 text-sm">
                  No blocks found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BlockSelector;
