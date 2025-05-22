import * as PIXI from 'pixi.js';
import { Point, PowerUpState } from '../../types';

interface PowerUpConfig {
  x: number;
  y: number;
  type: string;
}

export default class PowerUp {
  container: PIXI.Container;
  private text: PIXI.Text;
  private state: PowerUpState;
  private app: PIXI.Application;
  private hoverOffset: number = 0;

  constructor(app: PIXI.Application, config: PowerUpConfig) {
    this.app = app;
    
    this.state = {
      position: { x: config.x, y: config.y },
      velocity: { x: 0, y: 0 },
      size: { width: 30, height: 30 },
      isActive: true,
      type: 'weapon',
      value: 1
    };
    
    this.container = new PIXI.Container();
    this.container.position.set(this.state.position.x, this.state.position.y);
    
    // Create ASCII art for power-up
    this.text = new PIXI.Text(
      '[+1]', 
      { 
        fontFamily: 'Courier New',
        fontSize: 20,
        fill: 0xffff00,
        align: 'center'
      }
    );
    
    this.container.addChild(this.text);
    
    // Add floating animation
    this.app.ticker.add(this.animate, this);
  }

  animate(delta: number): void {
    if (!this.state.isActive) return;
    
    // Simple hovering animation
    this.hoverOffset += delta * 0.05;
    const hover = Math.sin(this.hoverOffset) * 5;
    
    this.container.position.set(
      this.state.position.x, 
      this.state.position.y + hover
    );
  }

  collect(): void {
    this.state.isActive = false;
    
    // Create collection animation
    const collectText = new PIXI.Text(
      '+1', 
      { 
        fontFamily: 'Courier New',
        fontSize: 24,
        fill: 0xffff00,
        align: 'center'
      }
    );
    
    this.container.removeChild(this.text);
    this.container.addChild(collectText);
    
    // Animate collection
    let animationFrame = 0;
    const animationInterval = setInterval(() => {
      animationFrame++;
      collectText.position.y -= 2;
      collectText.alpha -= 0.05;
      
      if (animationFrame >= 20) {
        clearInterval(animationInterval);
        this.container.removeChild(collectText);
      }
    }, 50);
  }

  getPosition(): Point {
    return { ...this.state.position };
  }

  getSize(): { width: number; height: number } {
    return { ...this.state.size };
  }

  getType(): string {
    return this.state.type;
  }

  destroy(): void {
    this.app.ticker.remove(this.animate, this);
  }
}