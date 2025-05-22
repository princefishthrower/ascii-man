import React from 'react';
import { WeaponData } from '../types';
import { weaponData } from '../game/entities/weapons';

interface GameHUDProps {
  score: number;
  lives: number;
  weaponLevel: number;
}

const GameHUD: React.FC<GameHUDProps> = ({ score, lives, weaponLevel }) => {
  const currentWeapon: WeaponData = weaponData[weaponLevel];
  
  return (
    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-black bg-opacity-70">
      <div className="flex items-center">
        <span className="mr-6">Score: {score}</span>
        <span>Lives: {"❤️".repeat(lives)}</span>
      </div>
      
      <div className="flex items-center">
        <span className="mr-2">Weapon:</span>
        <pre className="text-yellow-400">{currentWeapon.ascii}</pre>
        <span className="ml-2 text-xs">({currentWeapon.name})</span>
      </div>
    </div>
  );
};

export default GameHUD;