import React from 'react';
import { Play } from 'lucide-react';

interface GameMenuProps {
  onStartGame: () => void;
}

const GameMenu: React.FC<GameMenuProps> = ({ onStartGame }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 border border-gray-700 rounded-lg">
      <h2 className="text-2xl mb-6">Welcome to ASCII-MAN!</h2>
      
      <div className="mb-8 text-center">
        <pre className="text-green-400 mb-4">
{` o 
-|-
 ^
/ \\`}
        </pre>
        <p className="mb-4">Battle the evil TeXers and collect power-ups!</p>
        <p className="mb-4 text-xs opacity-70">
          Created with PixiJS and React
        </p>
      </div>
      
      <button 
        onClick={onStartGame}
        className="flex items-center bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-full transition-colors"
      >
        <Play size={20} className="mr-2" />
        Start Game
      </button>
    </div>
  );
};

export default GameMenu;