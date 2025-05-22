import React, { useEffect, useState } from 'react';
import GameCanvas from './game/GameCanvas';
import GameMenu from './components/GameMenu';
import GameHUD from './components/GameHUD';
import { GameState } from './types';

function App() {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    score: 0,
    lives: 3,
    weaponLevel: 0,
    currentLevel: 'test',
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyP') {
        setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      score: 0,
      lives: 3,
      weaponLevel: 0
    }));
  };

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white font-mono">
      <h1 className="text-4xl mb-4 font-bold">ASCII-MAN</h1>
      
      {!gameState.isPlaying ? (
        <GameMenu onStartGame={startGame} />
      ) : (
        <div className="relative w-full max-w-4xl">
          <GameHUD 
            score={gameState.score} 
            lives={gameState.lives} 
            weaponLevel={gameState.weaponLevel} 
          />
          <GameCanvas 
            gameState={gameState}
            updateGameState={updateGameState}
          />
        </div>
      )}
      
      <div className="mt-4 text-sm opacity-70">
        <p>Controls: Arrow keys to move, Space to jump, Z to shoot</p>
        <p>Press P to pause/unpause</p>
      </div>
    </div>
  );
}

export default App;