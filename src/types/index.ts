export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface GameState {
  isPlaying: boolean;
  score: number;
  lives: number;
  weaponLevel: number;
  currentLevel: string;
}

export interface EntityState {
  position: Point;
  velocity: Point;
  size: Size;
  isActive: boolean;
}

export interface ProjectileState extends EntityState {
  damage: number;
  character: string;
}

export interface PlayerState extends EntityState {
  isJumping: boolean;
  weaponLevel: number;
  shootCooldown: number;
}

export interface EnemyState extends EntityState {
  health: number;
  damage: number;
  character: string[];
  bounceHeight: number;
  direction: number;
}

export interface PowerUpState extends EntityState {
  type: 'weapon';
  value: number;
}

export interface LevelConfig {
  width: number;
  platforms: Array<{
    x: number;
    y: number;
    width: number;
  }>;
  enemies: Array<{
    x: number;
    y: number;
    type: string;
  }>;
  powerUps: Array<{
    x: number;
    y: number;
    type: 'weapon';
  }>;
}

export interface WeaponData {
  name: string;
  ascii: string;
  projectile: string;
  damage: number;
  cooldown: number;
  speed: number;
  pattern: 'single' | 'spread' | 'stream';
}