import * as PIXI from 'pixi.js';
import { Point, PlayerState } from '../../types';
import Projectile from './Projectile';
import { weaponData } from './weapons';

interface PlayerConfig {
  x: number;
  y: number;
}

export default class Player {
  container: PIXI.Container;
  private text: PIXI.Text;
  private state: PlayerState;
  private app: PIXI.Application;
  private invulnerableUntil: number = 0;
  private blinkInterval: number | null = null;

  constructor(app: PIXI.Application, config: PlayerConfig) {
    this.app = app;
    
    this.state = {
      position: { x: config.x, y: config.y },
      velocity: { x: 0, y: 0 },
      size: { width: 20, height: 15 }, // Reduced height to match legs only
      isActive: true,
      isJumping: false,
      weaponLevel: 0,
      shootCooldown: 0
    };
    
    this.container = new PIXI.Container();
    this.container.position.set(this.state.position.x, this.state.position.y);
    
    // Create ASCII art for player
    this.text = new PIXI.Text(
      ` o \n-|-\n ^ \n/ \\`, 
      { 
        fontFamily: 'Courier New',
        fontSize: 16,
        fill: 0x00ff00,
        align: 'center'
      }
    );
    
    this.container.addChild(this.text);
  }

  update(delta: number, input: { left: boolean; right: boolean; jump: boolean; shoot: boolean }): void {
    if (!this.state.isActive) return;
    
    // Movement
    const speed = 5;
    this.state.velocity.x = 0;
    
    if (input.left) {
      this.state.velocity.x = -speed;
    }
    
    if (input.right) {
      this.state.velocity.x = speed;
    }
    
    // Jumping
    if (input.jump && !this.state.isJumping) {
      this.state.velocity.y = -15;
      this.state.isJumping = true;
    }
    
    // Apply gravity
    this.state.velocity.y += 0.8 * delta;
    
    // Update position
    this.state.position.x += this.state.velocity.x * delta;
    this.state.position.y += this.state.velocity.y * delta;
    
    // Update cooldowns
    if (this.state.shootCooldown > 0) {
      this.state.shootCooldown -= delta;
    }
    
    // Update position
    this.container.position.set(this.state.position.x, this.state.position.y);
  }

  land(platformY: number): void {
    // Adjust position to platform top
    this.state.position.y = platformY - this.state.size.height;
    this.state.velocity.y = 0;
    this.state.isJumping = false;
    
    // Update container position
    this.container.position.set(this.state.position.x, this.state.position.y);
  }

  shoot(): Projectile[] {
    if (!this.canShoot()) return [];
    
    const weapon = weaponData[this.state.weaponLevel];
    this.state.shootCooldown = weapon.cooldown;
    
    // Create projectiles based on weapon pattern
    const projectiles: Projectile[] = [];
    
    const basePosition = {
      x: this.state.position.x + this.state.size.width,
      y: this.state.position.y + this.state.size.height / 2
    };
    
    switch (weapon.pattern) {
      case 'single':
        projectiles.push(
          new Projectile(this.app, {
            x: basePosition.x,
            y: basePosition.y,
            velocity: { x: weapon.speed, y: 0 },
            character: weapon.projectile,
            damage: weapon.damage
          })
        );
        break;
        
      case 'spread':
        projectiles.push(
          new Projectile(this.app, {
            x: basePosition.x,
            y: basePosition.y - 5,
            velocity: { x: weapon.speed, y: -1 },
            character: weapon.projectile[0],
            damage: weapon.damage
          }),
          new Projectile(this.app, {
            x: basePosition.x,
            y: basePosition.y,
            velocity: { x: weapon.speed, y: 0 },
            character: weapon.projectile[1],
            damage: weapon.damage
          }),
          new Projectile(this.app, {
            x: basePosition.x,
            y: basePosition.y + 5,
            velocity: { x: weapon.speed, y: 1 },
            character: weapon.projectile[2],
            damage: weapon.damage
          })
        );
        break;
        
      case 'stream':
        for (let i = 0; i < 5; i++) {
          projectiles.push(
            new Projectile(this.app, {
              x: basePosition.x + i * 8,
              y: basePosition.y,
              velocity: { x: weapon.speed, y: 0 },
              character: weapon.projectile,
              damage: weapon.damage / 5
            })
          );
        }
        break;
    }
    
    return projectiles;
  }

  canShoot(): boolean {
    return this.state.shootCooldown <= 0;
  }

  getPosition(): Point {
    // Adjust collision box to be at the feet
    return { 
      x: this.state.position.x,
      y: this.state.position.y + 25 // Offset to match feet position
    };
  }

  getSize(): { width: number; height: number } {
    return { ...this.state.size };
  }

  getVelocity(): Point {
    return { ...this.state.velocity };
  }

  getWeaponLevel(): number {
    return this.state.weaponLevel;
  }

  setWeaponLevel(level: number): void {
    this.state.weaponLevel = level;
  }

  setInvulnerable(duration: number): void {
    this.invulnerableUntil = Date.now() + duration;
    
    // Create blinking effect
    if (this.blinkInterval === null) {
      this.blinkInterval = window.setInterval(() => {
        this.text.visible = !this.text.visible;
        
        if (Date.now() > this.invulnerableUntil) {
          clearInterval(this.blinkInterval as number);
          this.blinkInterval = null;
          this.text.visible = true;
        }
      }, 100);
    }
  }

  isInvulnerable(): boolean {
    return Date.now() < this.invulnerableUntil;
  }

  applyKnockback(fromPosition: Point): void {
    const direction = this.state.position.x < fromPosition.x ? -1 : 1;
    this.state.velocity.x = direction * 10;
    this.state.velocity.y = -5;
  }

  destroy(): void {
    if (this.blinkInterval !== null) {
      clearInterval(this.blinkInterval);
    }
  }
}