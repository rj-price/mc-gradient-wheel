import { useState, useEffect } from 'react';
import { type Block, fetchBlocks, fetchGradient } from './api';
import ColorWheel from './components/ColorWheel';
import GradientDisplay from './components/GradientDisplay';

function App() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [startBlock, setStartBlock] = useState<Block | null>(null);
  const [endBlock, setEndBlock] = useState<Block | null>(null);
  const [gradient, setGradient] = useState<Block[]>([]);
  const [steps, setSteps] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlocks()
      .then(data => {
        setBlocks(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleBlockSelect = (block: Block) => {
    if (!startBlock || (startBlock && endBlock)) {
      setStartBlock(block);
      setEndBlock(null);
      setGradient([]);
    } else {
      setEndBlock(block);
    }
  };

  const generateGradient = async () => {
    if (!startBlock || !endBlock) return;
    try {
      const data = await fetchGradient(startBlock.id, endBlock.id, steps);
      setGradient(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading blocks...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
          Minecraft Color Wheel
        </h1>
        <p className="text-slate-400">Generate smooth block gradients using CIELAB color space</p>
      </header>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ColorWheel 
            blocks={blocks} 
            onSelect={handleBlockSelect}
            selectedStart={startBlock || undefined}
            selectedEnd={endBlock || undefined}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Selection</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded border-2 ${startBlock ? 'border-amber-400' : 'border-slate-700 bg-slate-900'}`} style={{ backgroundColor: startBlock?.hex }}></div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Start Block</p>
                  <p className="text-sm">{startBlock?.name || 'Select from wheel'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded border-2 ${endBlock ? 'border-blue-400' : 'border-slate-700 bg-slate-900'}`} style={{ backgroundColor: endBlock?.hex }}></div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">End Block</p>
                  <p className="text-sm">{endBlock?.name || 'Select from wheel'}</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <label className="block text-sm font-medium mb-2">Gradient Steps: {steps}</label>
              <input 
                type="range" 
                min="2" 
                max="15" 
                value={steps} 
                onChange={(e) => setSteps(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-6"
              />
              
              <button 
                onClick={generateGradient}
                disabled={!startBlock || !endBlock}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-bold transition-colors"
              >
                Generate Gradient
              </button>
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-xl shadow-lg text-xs text-slate-400">
            <h3 className="font-bold mb-2 uppercase tracking-wider text-slate-500">How to use</h3>
            <ul className="list-disc pl-4 space-y-1">
              <li>Adjust the <strong>Lightness Filter</strong> to find blocks by their brightness.</li>
              <li>Click a point on the <strong>Wheel</strong> to select the start block.</li>
              <li>Click another point to select the end block.</li>
              <li>Set the number of steps and hit <strong>Generate</strong>.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <GradientDisplay gradient={gradient} />
      </div>
    </div>
  );
}

export default App;
