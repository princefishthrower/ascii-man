import * as PIXI from 'pixi.js';
import { LevelConfig } from '../types';
import Player from './entities/Player';
import Enemy from './entities/Enemy';
import PowerUp from './entities/PowerUp';
import LevelManager from './levels/LevelManager';
import Projectile from './entities/Projectile';
import CollisionManager from './utils/CollisionManager';
import InputManager from './utils/InputManager';

interface GameCallbacks {
  onScoreChange: (score: number) => void;
  onLifeChange: (lives: number) => void;
  onWeaponChange: (weaponLevel: number) => void;
  onGameOver: () => void;
}

export default class GameEngine {
  private app: PIXI.Application;
  private levelManager: LevelManager;
  private player: Player;
  private enemies: Enemy[] = [];
  private powerUps: PowerUp[] = [];
  private projectiles: Projectile[] = [];
  private collisionManager: CollisionManager;
  private inputManager: InputManager;
  private gameContainer: PIXI.Container;
  private isPaused: boolean = false;
  private score: number = 0;
  private lives: number = 3;
  private callbacks: GameCallbacks;
  private levelWidth: number = 2000;
  private platforms: PIXI.Graphics[] = [];

  constructor(app: PIXI.Application, callbacks: GameCallbacks) {
    this.app = app;
    this.callbacks = callbacks;
    
    // Create a container for the game
    this.gameContainer = new PIXI.Container();
    this.app.stage.addChild(this.gameContainer);
    
    // Initialize managers
    this.levelManager = new LevelManager();
    this.collisionManager = new CollisionManager();
    this.inputManager = new InputManager();
    
    // Initialize player
    this.player = new Player(this.app, {
      x: 100,
      y: 300
    });
    this.gameContainer.addChild(this.player.container);

    // Setup game loop
    this.app.ticker.add(this.update.bind(this));
  }

  loadLevel(levelName: string): void {
    // Clear existing entities
    this.clearLevel();
    
    // Get level configuration
    const levelConfig = this.levelManager.getLevel(levelName);
    this.levelWidth = levelConfig.width;
    
    // Set up the level
    this.setupLevel(levelConfig);
  }

  private setupLevel(levelConfig: LevelConfig): void {
    // Create platforms
    levelConfig.platforms.forEach(platform => {
      const graphics = new PIXI.Graphics();
      graphics.beginFill(0x444444);
      graphics.drawRect(0, 0, platform.width, 20);
      graphics.endFill();
      graphics.position.set(platform.x, platform.y);
      this.platforms.push(graphics);
      this.gameContainer.addChild(graphics);
    });

    // Create enemies
    levelConfig.enemies.forEach(enemyConfig => {
      const enemy = new Enemy(this.app, enemyConfig);
      this.enemies.push(enemy);
      this.gameContainer.addChild(enemy.container);
    });

    // Create power-ups
    levelConfig.powerUps.forEach(powerUpConfig => {
      const powerUp = new PowerUp(this.app, powerUpConfig);
      this.powerUps.push(powerUp);
      this.gameContainer.addChild(powerUp.container);
    });
  }

  private clearLevel(): void {
    // Remove all enemies
    this.enemies.forEach(enemy => {
      this.gameContainer.removeChild(enemy.container);
      enemy.destroy();
    });
    this.enemies = [];

    // Remove all power-ups
    this.powerUps.forEach(powerUp => {
      this.gameContainer.removeChild(powerUp.container);
      powerUp.destroy();
    });
    this.powerUps = [];

    // Remove all projectiles
    this.projectiles.forEach(projectile => {
      this.gameContainer.removeChild(projectile.container);
      projectile.destroy();
    });
    this.projectiles = [];

    // Remove all platforms
    this.platforms.forEach(platform => {
      this.gameContainer.removeChild(platform);
    });
    this.platforms = [];
  }

  update(delta: number): void {
    if (this.isPaused) return;

    // Update input
    const input = this.inputManager.getInput();
    
    // Check platform collisions before updating player
    this.checkPlatformCollisions();
    
    // Update player
    this.player.update(delta, input);
    
    // Handle player shooting
    if (input.shoot && this.player.canShoot()) {
      const newProjectiles = this.player.shoot();
      newProjectiles.forEach(projectile => {
        this.projectiles.push(projectile);
        this.gameContainer.addChild(projectile.container);
      });
    }
    
    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(delta);
    });
    
    // Update projectiles
    this.projectiles.forEach(projectile => {
      projectile.update(delta);
    });
    
    // Check collisions
    this.handleCollisions();
    
    // Clean up inactive entities
    this.cleanupEntities();

    // Update camera position
    const playerX = this.player.getPosition().x;
    const halfWidth = this.app.screen.width / 2;
    
    if (playerX > halfWidth && playerX < this.levelWidth - halfWidth) {
      this.gameContainer.x = -playerX + halfWidth;
    }
  }

  private checkPlatformCollisions(): void {
    const playerPos = this.player.getPosition();
    const playerSize = this.player.getSize();
    const playerVelocity = this.player.getVelocity();
    
    // Only check for platform collisions if player is moving downward
    if (playerVelocity.y > 0) {
      for (const platform of this.platforms) {
        const platformBounds = platform.getBounds();
        
        // Check if player's feet are within platform bounds
        if (
          playerPos.x + playerSize.width > platformBounds.x &&
          playerPos.x < platformBounds.x + platformBounds.width &&
          playerPos.y + playerSize.height >= platformBounds.y &&
          playerPos.y + playerSize.height <= platformBounds.y + platformBounds.height
        ) {
          // Land on platform
          this.player.land(platformBounds.y);
          break;
        }
      }
    }
  }

  private handleCollisions(): void {
    // Check player-enemy collisions
    this.enemies.forEach(enemy => {
      if (this.collisionManager.checkCollision(this.player, enemy)) {
        this.handlePlayerEnemyCollision(enemy);
      }
    });
    
    // Check player-powerup collisions
    this.powerUps.forEach(powerUp => {
      if (this.collisionManager.checkCollision(this.player, powerUp)) {
        this.handlePlayerPowerUpCollision(powerUp);
      }
    });
    
    // Check projectile-enemy collisions
    this.projectiles.forEach(projectile => {
      this.enemies.forEach(enemy => {
        if (this.collisionManager.checkCollision(projectile, enemy)) {
          this.handleProjectileEnemyCollision(projectile, enemy);
        }
      });
    });
  }

  private handlePlayerEnemyCollision(enemy: Enemy): void {
    if (!enemy.isActive || this.player.isInvulnerable()) return;
    
    this.lives--;
    this.callbacks.onLifeChange(this.lives);
    
    if (this.lives <= 0) {
      this.callbacks.onGameOver();
      return;
    }
    
    // Make player temporarily invulnerable
    this.player.setInvulnerable(2000);
    
    // Knockback
    this.player.applyKnockback(enemy.getPosition());
  }

  private handlePlayerPowerUpCollision(powerUp: PowerUp): void {
    if (!powerUp.isActive) return;
    
    if (powerUp.getType() === 'weapon') {
      const nextWeaponLevel = Math.min(this.player.getWeaponLevel() + 1, 4);
      this.player.setWeaponLevel(nextWeaponLevel);
      this.callbacks.onWeaponChange(nextWeaponLevel);
    }
    
    powerUp.collect();
    this.score += 100;
    this.callbacks.onScoreChange(this.score);
  }

  private handleProjectileEnemyCollision(projectile: Projectile, enemy: Enemy): void {
    if (!projectile.isActive || !enemy.isActive) return;
    
    enemy.takeDamage(projectile.getDamage());
    projectile.hit();
    
    if (!enemy.isActive) {
      this.score += 200;
      this.callbacks.onScoreChange(this.score);
    }
  }

  private cleanupEntities(): void {
    // Remove inactive projectiles
    this.projectiles = this.projectiles.filter(projectile => {
      if (!projectile.isActive) {
        this.gameContainer.removeChild(projectile.container);
        projectile.destroy();
        return false;
      }
      return true;
    });
    
    // Remove inactive enemies
    this.enemies = this.enemies.filter(enemy => {
      if (!enemy.isActive) {
        this.gameContainer.removeChild(enemy.container);
        enemy.destroy();
        return false;
      }
      return true;
    });
    
    // Remove collected power-ups
    this.powerUps = this.powerUps.filter(powerUp => {
      if (!powerUp.isActive) {
        this.gameContainer.removeChild(powerUp.container);
        powerUp.destroy();
        return false;
      }
      return true;
    });
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  start(): void {
    this.isPaused = false;
  }

  destroy(): void {
    this.app.ticker.remove(this.update.bind(this));
    this.clearLevel();
    this.player.destroy();
    this.inputManager.destroy();
  }
}