import * as PIXI from 'pixi.js';
import { Point, ProjectileState } from '../../types';

interface ProjectileConfig {
  x: number;
  y: number;
  velocity: Point;
  character: string;
  damage: number;
}

export default class Projectile {
  container: PIXI.Container;
  private text: PIXI.Text;
  private state: ProjectileState;
  private app: PIXI.Application;

  constructor(app: PIXI.Application, config: ProjectileConfig) {
    this.app = app;
    
    this.state = {
      position: { x: config.x, y: config.y },
      velocity: { ...config.velocity },
      size: { width: 10, height: 10 },
      isActive: true,
      damage: config.damage,
      character: config.character
    };
    
    this.container = new PIXI.Container();
    this.container.position.set(this.state.position.x, this.state.position.y);
    
    // Create ASCII art for projectile
    this.text = new PIXI.Text(
      this.state.character, 
      { 
        fontFamily: 'Courier New',
        fontSize: 16,
        fill: 0xffff00,
        align: 'center'
      }
    );
    
    this.container.addChild(this.text);
  }

  update(delta: number): void {
    if (!this.state.isActive) return;
    
    // Update position
    this.state.position.x += this.state.velocity.x * delta;
    this.state.position.y += this.state.velocity.y * delta;
    
    // Check if out of bounds
    if (
      this.state.position.x < 0 || 
      this.state.position.x > this.app.screen.width ||
      this.state.position.y < 0 || 
      this.state.position.y > this.app.screen.height
    ) {
      this.state.isActive = false;
    }
    
    // Update container position
    this.container.position.set(this.state.position.x, this.state.position.y);
  }

  hit(): void {
    this.state.isActive = false;
    
    // Create hit effect
    const hitText = new PIXI.Text(
      '*', 
      { 
        fontFamily: 'Courier New',
        fontSize: 20,
        fill: 0xffffff,
        align: 'center'
      }
    );
    
    hitText.position.set(0, 0);
    
    this.container.removeChild(this.text);
    this.container.addChild(hitText);
    
    // Animate hit effect
    let animationFrame = 0;
    const animationInterval = setInterval(() => {
      animationFrame++;
      hitText.alpha -= 0.1;
      
      if (animationFrame >= 10) {
        clearInterval(animationInterval);
        this.container.removeChild(hitText);
      }
    }, 30);
  }

  getPosition(): Point {
    return { ...this.state.position };
  }

  getSize(): { width: number; height: number } {
    return { ...this.state.size };
  }

  getDamage(): number {
    return this.state.damage;
  }

  destroy(): void {
    // Cleanup
  }
}