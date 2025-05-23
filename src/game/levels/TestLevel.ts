import { LevelConfig } from '../../types';

export const testLevel: LevelConfig = {
  width: 2000,
  platforms: [
    // Main ground
    { x: 0, y: 550, width: 2000 },
    
    // Lower platforms for easier jumping
    { x: 200, y: 450, width: 200 },
    { x: 500, y: 450, width: 200 },
    { x: 800, y: 450, width: 200 },
    { x: 1100, y: 450, width: 200 },
    { x: 1400, y: 450, width: 200 },
    { x: 1700, y: 450, width: 200 }
  ],
  enemies: [
    // Enemies placed on platforms and ground
    { x: 300, y: 500, type: 'basic' },
    { x: 600, y: 500, type: 'basic' },
    { x: 900, y: 500, type: 'medium' },
    { x: 1200, y: 500, type: 'medium' },
    { x: 1500, y: 500, type: 'advanced' }
  ],
  powerUps: [
    // Kept two power-ups, one slightly above a platform, one higher up
    { x: 250, y: 400, type: 'weapon' }, // Above the platform at x:200
    { x: 1000, y: 350, type: 'weapon' }, // Higher above the platform at x:800 or x:1100
    { x: 1050, y: 350, type: 'weapon' },
    { x: 1100, y: 350, type: 'weapon' },
    { x: 1150, y: 350, type: 'weapon' },
    { x: 1200, y: 350, type: 'weapon' }
  ]
};