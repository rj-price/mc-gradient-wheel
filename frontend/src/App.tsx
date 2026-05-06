import { useState, useEffect } from 'react';
import { type Block, fetchBlocks, fetchGradient } from './api';
import ColorWheel from './components/ColorWheel';
import GradientDisplay from './components/GradientDisplay';
import BlockSelector from './components/BlockSelector';

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse">Loading blocks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        <header className="mb-12 text-center space-y-4">
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">
            Minecraft Builder Tools
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Gradient <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-400">Master</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Create seamless block transitions for your builds using advanced CIELAB colour mathematics.
          </p>
        </header>

        {error && (
          <div className="max-w-3xl mx-auto bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-2xl mb-8 flex items-center gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Workspace - Color Wheel */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8 order-2 lg:order-1">
            <ColorWheel 
              blocks={blocks} 
              onSelect={handleBlockSelect}
              selectedStart={startBlock || undefined}
              selectedEnd={endBlock || undefined}
            />
            
            <div className="hidden lg:block">
              <GradientDisplay gradient={gradient} />
            </div>
          </div>

          {/* Sidebar - Controls */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 order-1 lg:order-2 sticky top-8">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-[2rem] shadow-2xl space-y-8">
              <div className="space-y-6">
                <BlockSelector 
                  blocks={blocks}
                  label="Start Block"
                  selectedBlock={startBlock}
                  onSelect={setStartBlock}
                  colorClass="border-amber-400 shadow-amber-500/20"
                />

                <BlockSelector 
                  blocks={blocks}
                  label="End Block"
                  selectedBlock={endBlock}
                  onSelect={setEndBlock}
                  colorClass="border-blue-400 shadow-blue-500/20"
                />
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-800">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Gradient Steps</label>
                    <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-md text-sm font-bold">{steps}</span>
                  </div>
                  <input 
                    type="range" 
                    min="2" 
                    max="15" 
                    value={steps} 
                    onChange={(e) => setSteps(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 transition-all hover:accent-indigo-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-600 font-bold uppercase">
                    <span>Quick</span>
                    <span>Detailed</span>
                  </div>
                </div>
                
                <button 
                  onClick={generateGradient}
                  disabled={!startBlock || !endBlock}
                  className="group relative w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed rounded-2xl font-bold text-lg transition-all active:scale-[0.98] overflow-hidden"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {(!startBlock || !endBlock) ? (
                      <span>Select Blocks to Begin</span>
                    ) : (
                      <>
                        <span>Generate Palette</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-[2rem] text-sm text-slate-400">
              <h3 className="font-bold mb-3 uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Quick Tips
              </h3>
              <ul className="space-y-2">
                <li className="flex gap-2 leading-relaxed italic text-xs">
                  <span className="text-indigo-500 font-bold">•</span>
                  Use the <strong className="text-slate-300">Lightness Filter</strong> on the wheel to find blocks of similar brightness.
                </li>
                <li className="flex gap-2 leading-relaxed italic text-xs">
                  <span className="text-indigo-500 font-bold">•</span>
                  Clicking the wheel automatically sets the next selection.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 lg:hidden order-3">
          <GradientDisplay gradient={gradient} />
        </div>
        
        <footer className="mt-20 py-8 border-t border-slate-900 text-center text-slate-600 text-xs">
          <p>© 2026 Minecraft Gradient Master • Powered by CIELAB Mathematics</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
