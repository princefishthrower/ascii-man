import * as PIXI from 'pixi.js';
import { Point, EnemyState } from '../../types';

interface EnemyConfig {
  x: number;
  y: number;
  type: string;
}

// Different enemy types
const ENEMY_TYPES: Record<string, { 
  character: string[], 
  health: number, 
  damage: number,
  bounceHeight: number
}> = {
  basic: {
    character: ['\\Lambda', '\\sigma', '\\sum'],
    health: 1,
    damage: 1,
    bounceHeight: 3
  },
  medium: {
    character: ['\\int', '\\nabla', '\\Phi'],
    health: 2,
    damage: 1,
    bounceHeight: 4
  },
  advanced: {
    character: ['\\Omega', '\\prod', '\\forall'],
    health: 3,
    damage: 2,
    bounceHeight: 5
  }
};

export default class Enemy {
  container: PIXI.Container;
  private text: PIXI.Text;
  private state: EnemyState;
  private app: PIXI.Application;
  private bounceTimer: number = 0;

  constructor(app: PIXI.Application, config: EnemyConfig) {
    this.app = app;
    
    const enemyType = ENEMY_TYPES[config.type] || ENEMY_TYPES.basic;
    
    this.state = {
      position: { x: config.x, y: config.y },
      velocity: { x: 0, y: 0 },
      size: { width: 20, height: 20 },
      isActive: true,
      health: enemyType.health,
      damage: enemyType.damage,
      character: enemyType.character,
      bounceHeight: enemyType.bounceHeight,
      direction: -1 // Moving left initially
    };
    
    this.container = new PIXI.Container();
    this.container.position.set(this.state.position.x, this.state.position.y);
    
    // Randomly select one of the characters for this enemy
    const selectedChar = this.state.character[
      Math.floor(Math.random() * this.state.character.length)
    ];
    
    // Create ASCII art for enemy
    this.text = new PIXI.Text(selectedChar, { 
      fontFamily: 'Courier New',
      fontSize: 20,
      fill: 0xff0000,
      align: 'center'
    });
    
    this.container.addChild(this.text);
  }

  update(delta: number): void {
    if (!this.state.isActive) return;
    
    // Bouncing movement
    this.bounceTimer += delta * 0.1;
    const bounce = Math.sin(this.bounceTimer) * this.state.bounceHeight;
    
    // Horizontal movement
    const speed = 1;
    this.state.position.x += this.state.direction * speed * delta;
    
    // Change direction when hitting boundaries
    if (
      this.state.position.x < 0 || 
      this.state.position.x > this.app.screen.width - this.state.size.width
    ) {
      this.state.direction *= -1;
    }
    
    // Update position with bounce
    this.container.position.set(
      this.state.position.x, 
      this.state.position.y + bounce
    );
  }

  takeDamage(amount: number): void {
    this.state.health -= amount;
    
    // Flash red when hit
    this.text.style.fill = 0xffffff;
    setTimeout(() => {
      if (this.state.isActive) {
        this.text.style.fill = 0xff0000;
      }
    }, 100);
    
    if (this.state.health <= 0) {
      this.state.isActive = false;
    }
  }

  getPosition(): Point {
    return { ...this.state.position };
  }

  getSize(): { width: number; height: number } {
    return { ...this.state.size };
  }

  destroy(): void {
    // Cleanup any resources
  }
}