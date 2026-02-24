import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Timer, RotateCcw, Play, Info, BarChart3, ChevronRight, Languages } from 'lucide-react';
import confetti from 'canvas-confetti';
import { translations, Language } from './i18n';

// --- Types ---
interface GameState {
  status: 'idle' | 'playing' | 'gameover';
  score: number;
  level: number;
  timeLeft: number;
}

interface ColorBlock {
  id: number;
  color: string;
  isTarget: boolean;
}

// --- Constants ---
const GRID_SIZE = 5;
const INITIAL_TIME = 15;
const TIME_BONUS = 2;

// --- Helper Functions ---
const generateColors = (level: number): ColorBlock[] => {
  const baseHue = Math.floor(Math.random() * 360);
  const baseSaturation = 50 + Math.random() * 30;
  const baseLightness = 40 + Math.random() * 20;

  // Difficulty scaling: difference decreases as level increases
  const diff = Math.max(1.5, 15 - Math.floor(level / 1.5));
  
  const targetIndex = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
  
  return Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
    const isTarget = i === targetIndex;
    const lightness = isTarget ? baseLightness + diff : baseLightness;
    return {
      id: i,
      color: `hsl(${baseHue}, ${baseSaturation}%, ${lightness}%)`,
      isTarget,
    };
  });
};

export default function App() {
  const [lang, setLang] = useState<Language>('zh');
  const t = translations[lang];

  const [gameState, setGameState] = useState<GameState>({
    status: 'idle',
    score: 0,
    level: 1,
    timeLeft: INITIAL_TIME,
  });
  const [blocks, setBlocks] = useState<ColorBlock[]>([]);
  const [highScore, setHighScore] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize blocks
  useEffect(() => {
    if (gameState.status === 'playing') {
      setBlocks(generateColors(gameState.level));
    }
  }, [gameState.status, gameState.level]);

  // Timer logic
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeLeft: Math.max(0, prev.timeLeft - 0.1),
        }));
      }, 100);
    } else if (gameState.timeLeft <= 0 && gameState.status === 'playing') {
      setGameState(prev => ({ ...prev, status: 'gameover' }));
      if (gameState.score > highScore) setHighScore(gameState.score);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.status, gameState.timeLeft, gameState.score, highScore]);

  const handleBlockClick = (isTarget: boolean) => {
    if (!isTarget) {
      setGameState(prev => ({ ...prev, timeLeft: Math.max(0, prev.timeLeft - 3) }));
      return;
    }

    setGameState(prev => ({
      ...prev,
      score: prev.score + 1,
      level: prev.level + 1,
      timeLeft: Math.min(INITIAL_TIME, prev.timeLeft + TIME_BONUS),
    }));
  };

  const startGame = () => {
    setGameState({
      status: 'playing',
      score: 0,
      level: 1,
      timeLeft: INITIAL_TIME,
    });
  };

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'zh' : 'en');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#F5F5F0]">
      <main className="max-w-2xl mx-auto px-6 py-8 md:py-16 flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="mb-8 md:mb-12 flex justify-between items-end border-b border-[#141414]/10 pb-6">
          <div className="flex flex-col gap-2">
            <button 
              onClick={toggleLang}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono opacity-50 hover:opacity-100 transition-opacity w-fit"
            >
              <Languages className="w-3 h-3" />
              {lang === 'en' ? '中文' : 'English'}
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif italic tracking-tight mb-1">{t.title}</h1>
              <p className="text-[10px] md:text-xs uppercase tracking-widest opacity-50 font-mono">{t.subtitle}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] md:text-xs uppercase tracking-widest opacity-50 font-mono mb-1">{t.highScore}</p>
            <p className="text-xl md:text-2xl font-mono leading-none">{highScore}</p>
          </div>
        </header>

        <div className="flex-grow flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {gameState.status === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-8"
              >
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-serif italic">{t.testEyes}</h2>
                  <p className="text-base md:text-lg opacity-70 max-w-md mx-auto">
                    {t.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="p-4 border border-[#141414]/10 rounded-2xl bg-white/50">
                    <Info className="w-5 h-5 mb-2 opacity-50" />
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-1">{t.precision}</h3>
                    <p className="text-xs opacity-60">{t.precisionDesc}</p>
                  </div>
                  <div className="p-4 border border-[#141414]/10 rounded-2xl bg-white/50">
                    <Timer className="w-5 h-5 mb-2 opacity-50" />
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-1">{t.speed}</h3>
                    <p className="text-xs opacity-60">{t.speedDesc}</p>
                  </div>
                  <div className="p-4 border border-[#141414]/10 rounded-2xl bg-white/50">
                    <BarChart3 className="w-5 h-5 mb-2 opacity-50" />
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-1">{t.analysis}</h3>
                    <p className="text-xs opacity-60">{t.analysisDesc}</p>
                  </div>
                </div>

                <div className="bg-[#141414]/5 p-4 rounded-xl text-left">
                  <p className="text-[10px] uppercase tracking-widest font-mono opacity-50 mb-2">{t.theoryTip}</p>
                  <p className="text-xs italic opacity-70">
                    {t.theoryText}
                  </p>
                </div>

                <button
                  onClick={startGame}
                  className="group relative inline-flex items-center gap-3 bg-[#141414] text-[#F5F5F0] px-8 py-4 rounded-full text-lg font-medium transition-transform hover:scale-105 active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {t.startBtn}
                  <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </button>
              </motion.div>
            )}

            {gameState.status === 'playing' && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Stats Bar */}
                <div className="flex justify-between items-center font-mono text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="opacity-50 uppercase tracking-wider">{t.score}</span>
                      <span className="text-xl font-bold">{gameState.score}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="opacity-50 uppercase tracking-wider">{t.level}</span>
                      <span className="text-xl font-bold">{gameState.level}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Timer className="w-4 h-4 opacity-50" />
                    <div className="w-24 md:w-32 h-2 bg-[#141414]/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-[#141414]"
                        animate={{ width: `${(gameState.timeLeft / INITIAL_TIME) * 100}%` }}
                        transition={{ duration: 0.1, ease: "linear" }}
                      />
                    </div>
                    <span className="w-8 text-right font-bold">{gameState.timeLeft.toFixed(1)}s</span>
                  </div>
                </div>

                {/* Grid */}
                <div 
                  className="grid gap-2 aspect-square w-full max-w-md mx-auto"
                  style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
                >
                  {blocks.map((block) => (
                    <motion.button
                      key={`${block.id}-${gameState.level}`}
                      whileHover={{ scale: 0.98 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleBlockClick(block.isTarget)}
                      className="w-full h-full rounded-lg shadow-sm transition-shadow hover:shadow-md cursor-pointer"
                      style={{ backgroundColor: block.color }}
                    />
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-xs font-mono opacity-40 uppercase tracking-widest">
                    {t.findBlock}
                  </p>
                </div>
              </motion.div>
            )}

            {gameState.status === 'gameover' && (
              <motion.div
                key="gameover"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
              >
                <div className="space-y-2">
                  <Trophy className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-20" />
                  <h2 className="text-4xl md:text-5xl font-serif italic">{t.timesUp}</h2>
                  <p className="text-lg md:text-xl opacity-60">{t.perceptionScore}</p>
                </div>

                <div className="flex justify-center gap-8 md:gap-12 py-8 border-y border-[#141414]/10">
                  <div>
                    <p className="text-[10px] md:text-xs uppercase tracking-widest opacity-50 font-mono mb-2">{t.finalScore}</p>
                    <p className="text-4xl md:text-6xl font-mono">{gameState.score}</p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs uppercase tracking-widest opacity-50 font-mono mb-2">{t.levelReached}</p>
                    <p className="text-4xl md:text-6xl font-mono">{gameState.level}</p>
                  </div>
                </div>

                <div className="bg-white/50 p-6 rounded-3xl border border-[#141414]/5 text-left space-y-4">
                  <h3 className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    {t.sensitivityAnalysis}
                  </h3>
                  <p className="text-sm opacity-70 leading-relaxed">
                    {gameState.score > 30 
                      ? t.analysisExceptional
                      : gameState.score > 20
                      ? t.analysisHigh
                      : gameState.score > 10
                      ? t.analysisDeveloping
                      : t.analysisBeginner}
                  </p>
                </div>

                <button
                  onClick={startGame}
                  className="inline-flex items-center gap-3 bg-[#141414] text-[#F5F5F0] px-8 py-4 rounded-full text-lg font-medium transition-transform hover:scale-105 active:scale-95"
                >
                  <RotateCcw className="w-5 h-5" />
                  {t.tryAgain}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-[#141414]/10 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-mono opacity-30">
          <span>{t.copyright}</span>
          <span>{t.version}</span>
        </footer>
      </main>
    </div>
  );
}
