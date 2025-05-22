import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { GameState } from '../types';
import GameEngine from './GameEngine';

interface GameCanvasProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, updateGameState }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Clear any existing canvas
    canvasRef.current.innerHTML = '';

    // Initialize PIXI Application
    const app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x000000,
      antialias: false,
    });

    // Add the canvas to the DOM
    canvasRef.current.appendChild(app.view as HTMLCanvasElement);

    // Create and initialize the game engine
    const gameEngine = new GameEngine(app, {
      onScoreChange: (score) => updateGameState({ score }),
      onLifeChange: (lives) => updateGameState({ lives }),
      onWeaponChange: (weaponLevel) => updateGameState({ weaponLevel }),
      onGameOver: () => updateGameState({ isPlaying: false }),
    });

    gameEngine.loadLevel(gameState.currentLevel);
    gameEngine.start();
    
    gameEngineRef.current = gameEngine;

    // Cleanup function
    return () => {
      gameEngine.destroy();
      app.destroy(true, true);
    };
  }, []);

  // Handle pause state changes
  useEffect(() => {
    if (gameEngineRef.current) {
      if (gameState.isPlaying) {
        gameEngineRef.current.resume();
      } else {
        gameEngineRef.current.pause();
      }
    }
  }, [gameState.isPlaying]);

  return (
    <div 
      ref={canvasRef} 
      className="w-full aspect-[4/3] bg-black border border-gray-700 rounded-lg overflow-hidden"
    />
  );
};

export default GameCanvas;