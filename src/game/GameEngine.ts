import * as PIXI from 'pixi.js';
import { LevelConfig } from '../types';
import Player from './entities/Player';
import Enemy from './entities/Enemy';
import PowerUp from './entities/PowerUp';
import LevelManager from './levels/LevelManager';
import Projectile from './entities/Projectile';
import CollisionManager from './utils/CollisionManager';
import InputManager from './utils/InputManager';
import { weaponData } from './entities/weapons';

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
  private platforms: PIXI.Container[] = [];

  constructor(app: PIXI.Application, callbacks: GameCallbacks) {
    this.app = app;
    this.callbacks = callbacks;
    
    // Create a container for the game
    this.gameContainer = new PIXI.Container();
    this.gameContainer.sortableChildren = true; // Enable sorting for zIndex
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
    // Create platforms using "=" character
    levelConfig.platforms.forEach(platform => {
      const container = new PIXI.Container();
      container.position.set(platform.x, platform.y);
      
      // Create a text of repeated "=" characters for the platform
      const platformText = new PIXI.Text(
        "=".repeat(Math.ceil(platform.width / 8)), // Approximately scale to the desired width 
        { 
          fontFamily: 'Courier New',
          fontSize: 16,
          fill: 0xffffff, // White color
          align: 'left'
        }
      );
      
      container.addChild(platformText);
      
      // Create an invisible hitbox for collisions
      const hitbox = new PIXI.Graphics();
      hitbox.beginFill(0x000000, 0); // Transparent fill
      hitbox.drawRect(0, 0, platform.width, 16); // Match height to font size
      hitbox.endFill();
      
      container.addChild(hitbox);
      
      // Store the container's Graphics object for collision detection
      (container as any).getBounds = () => {
        return new PIXI.Rectangle(platform.x, platform.y, platform.width, 16);
      };
      
      this.platforms.push(container as any);
      this.gameContainer.addChild(container);
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
      console.log('PowerUp created and added to gameContainer:', powerUpConfig, powerUp.container.zIndex);
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
    
    // Log input for debugging
    if (input.shoot) {
      // console.log('Shoot input detected in GameEngine'); // Reduced console noise
    }
    
    // Check platform collisions before updating player
    this.checkPlatformCollisions();
    
    // Update player and get any new projectiles
    const newProjectilesFromPlayer = this.player.update(delta, input);
    
    // Handle player shooting - projectiles are now returned from player.update
    if (newProjectilesFromPlayer.length > 0) {
      console.log('Player shot, creating projectiles in GameEngine:', newProjectilesFromPlayer.length);
      newProjectilesFromPlayer.forEach(projectile => {
        this.projectiles.push(projectile);
        this.gameContainer.addChild(projectile.container);
        // Ensure projectile container is visible and has proper z-index
        projectile.container.visible = true;
        projectile.container.zIndex = 100; // Ensure projectiles are rendered above other elements
        console.log('Added projectile to game container at position:', projectile.getPosition());
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
        // Using the getBounds method we attached to the platform container
        const platformBounds = platform.getBounds();
        
        // Check if player's feet are within platform bounds
        if (
          playerPos.x + playerSize.width > platformBounds.x &&
          playerPos.x < platformBounds.x + platformBounds.width &&
          playerPos.y + playerSize.height >= platformBounds.y - 2 && // Detect collision slightly above platform
          playerPos.y + playerSize.height <= platformBounds.y + 10 // Allow for a little overlap
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
    if (!enemy.getIsActive() || this.player.isInvulnerable()) return;
    
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
    if (!powerUp.getIsActive()) return;
    
    if (powerUp.getType() === 'weapon') {
      const currentWeaponLevel = this.player.getWeaponLevel();
      const nextWeaponLevel = Math.min(currentWeaponLevel + 1, weaponData.length - 1);
      this.player.setWeaponLevel(nextWeaponLevel);
      this.callbacks.onWeaponChange(nextWeaponLevel);
    }
    
    powerUp.collect();
    this.score += 100;
    this.callbacks.onScoreChange(this.score);
  }

  private handleProjectileEnemyCollision(projectile: Projectile, enemy: Enemy): void {
    if (!projectile.getIsActive() || !enemy.getIsActive()) return;
    
    enemy.takeDamage(projectile.getDamage());
    projectile.hit();
    
    if (!(enemy as any).isActive) {
      this.score += 200;
      this.callbacks.onScoreChange(this.score);
    }
  }

  private cleanupEntities(): void {
    // Remove inactive projectiles
    this.projectiles = this.projectiles.filter(projectile => {
      if (!projectile.getIsActive()) {
        this.gameContainer.removeChild(projectile.container);
        projectile.destroy();
        return false;
      }
      return true;
    });
    
    // Remove inactive enemies
    this.enemies = this.enemies.filter(enemy => {
      if (!enemy.getIsActive()) {
        this.gameContainer.removeChild(enemy.container);
        enemy.destroy();
        return false;
      }
      return true;
    });
    
    // Remove collected power-ups
    this.powerUps = this.powerUps.filter(powerUp => {
      if (!powerUp.getIsActive()) {
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