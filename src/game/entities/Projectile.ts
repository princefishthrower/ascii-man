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
        fontSize: 24, // Increased size
        fill: 0xffff00, // Yellow
        align: 'center',
        fontWeight: 'bold' // Make it bold
      }
    );
    
    // Center the text within the container
    this.text.anchor.set(0.5);
    
    // Set zIndex to ensure projectiles are visible above other elements
    this.container.zIndex = 100;
    
    // Flip the character if moving left
    if (config.velocity.x < 0) {
      this.text.scale.x = -1;
    }
    
    this.container.addChild(this.text);
    
    // Log that a projectile was created with important details
    console.log('Projectile created at position:', this.state.position, 'with character:', this.state.character, 'velocity:', this.state.velocity);
  }

  update(delta: number): void {
    if (!this.state.isActive) return;
    
    // Update position
    this.state.position.x += this.state.velocity.x * delta;
    this.state.position.y += this.state.velocity.y * delta;
    
    // Log projectile position periodically for debugging
    if (Math.random() < 0.01) { // Only log occasionally to prevent console spam
      console.log('Projectile position:', this.state.position);
    }
    
    // Check if out of bounds - with much larger bounds so projectiles stay on screen longer
    if (
      this.state.position.x < -500 || 
      this.state.position.x > this.app.screen.width + 500 ||
      this.state.position.y < -500 || 
      this.state.position.y > this.app.screen.height + 500
    ) {
      console.log('Projectile went out of bounds and was deactivated');
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

  getIsActive(): boolean {
    return this.state.isActive;
  }

  destroy(): void {
    // Cleanup
  }
}