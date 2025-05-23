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
  private facingDirection: 'left' | 'right' = 'right';

  constructor(app: PIXI.Application, config: PlayerConfig) {
    this.app = app;
    
    this.state = {
      position: { x: config.x, y: config.y },
      velocity: { x: 0, y: 0 },
      size: { width: 20, height: 64 }, // Full height of the ASCII character
      isActive: true,
      isJumping: false,
      weaponLevel: 0, // Initial weapon is Rock (index 0)
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
        fill: 0xffffff, // Changed to white
        align: 'center'
      }
    );
    
    this.container.addChild(this.text);
    
    // Initialize with right-facing sprite
    this.facingDirection = 'right';
    this.updateSpriteDirection();
  }

  update(delta: number, input: { left: boolean; right: boolean; jump: boolean; shoot: boolean }): Projectile[] {
    if (!this.state.isActive) return [];
    
    let newProjectiles: Projectile[] = [];
    
    // Movement
    const speed = 5;
    this.state.velocity.x = 0;
    
    if (input.left) {
      this.state.velocity.x = -speed;
      if (this.facingDirection !== 'left') {
        this.facingDirection = 'left';
        this.updateSpriteDirection();
      }
    }
    
    if (input.right) {
      this.state.velocity.x = speed;
      if (this.facingDirection !== 'right') {
        this.facingDirection = 'right';
        this.updateSpriteDirection();
      }
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
    
    // Handle shooting
    if (input.shoot && this.canShoot()) {
      newProjectiles = this.shoot();
    }
    
    // Update position
    this.container.position.set(this.state.position.x, this.state.position.y);
    return newProjectiles;
  }

  land(platformY: number): void {
    // Position player's feet on the platform
    this.state.position.y = platformY - this.state.size.height;
    this.state.velocity.y = 0;
    this.state.isJumping = false;
    
    // Update container position
    this.container.position.set(this.state.position.x, this.state.position.y);
  }

  shoot(): Projectile[] {
    if (!this.canShoot()) {
      console.log('Cannot shoot, cooldown:', this.state.shootCooldown);
      return [];
    }
    
    console.log('Shooting with weapon level:', this.state.weaponLevel);
    const weapon = weaponData[this.state.weaponLevel];
    console.log('Weapon data:', weapon);
    this.state.shootCooldown = weapon.cooldown;
    
    // Create projectiles based on weapon pattern
    const projectiles: Projectile[] = [];
    
    // Ensure text dimensions are available
    const playerTextWidth = this.text.width || (3 * 8); // Approx 3 chars wide, 8px per char if not yet rendered
    const playerTextHeight = this.text.height || (4 * 16); // Approx 4 lines, 16px per line

    // Calculate weapon length for positioning
    const weaponLength = weapon.ascii.length * 8; // Approx 8px per character
    
    // Adjust base position and velocity based on facing direction
    const velocityMultiplier = this.facingDirection === 'right' ? 1 : -1;
    
    const basePosition = {
      x: this.facingDirection === 'right' 
        ? this.state.position.x + playerTextWidth + weaponLength/2  // Position at the tip of the right-facing weapon
        : this.state.position.x - weaponLength/2,                   // Position at the tip of the left-facing weapon
      y: this.state.position.y + (playerTextHeight * (1.5 / 4))     // Align with the arm (2nd line of 4)
    };
    
    console.log('Base position for projectile:', basePosition);
    
    switch (weapon.pattern) {
      case 'single':
        console.log('Creating single projectile with character:', weapon.projectile);
        const newProjectile = new Projectile(this.app, {
          x: basePosition.x,
          y: basePosition.y,
          velocity: { x: weapon.speed * velocityMultiplier, y: 0 },
          character: weapon.projectile,
          damage: weapon.damage
        });
        console.log('Single projectile created:', newProjectile);
        projectiles.push(newProjectile);
        break;
        
      case 'spread':
        projectiles.push(
          new Projectile(this.app, {
            x: basePosition.x,
            y: basePosition.y - 5,
            velocity: { x: weapon.speed * velocityMultiplier, y: -1 },
            character: weapon.projectile[0],
            damage: weapon.damage
          }),
          new Projectile(this.app, {
            x: basePosition.x,
            y: basePosition.y,
            velocity: { x: weapon.speed * velocityMultiplier, y: 0 },
            character: weapon.projectile[1],
            damage: weapon.damage
          }),
          new Projectile(this.app, {
            x: basePosition.x,
            y: basePosition.y + 5,
            velocity: { x: weapon.speed * velocityMultiplier, y: 1 },
            character: weapon.projectile[2],
            damage: weapon.damage
          })
        );
        break;
        
      case 'stream':
        for (let i = 0; i < 5; i++) {
          const offset = i * 8 * velocityMultiplier;
          projectiles.push(
            new Projectile(this.app, {
              x: basePosition.x + offset,
              y: basePosition.y,
              velocity: { x: weapon.speed * velocityMultiplier, y: 0 },
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
    console.log('Checking canShoot, cooldown:', this.state.shootCooldown);
    return this.state.shootCooldown <= 0;
  }

  getPosition(): Point {
    // Return the actual player position without any offset
    // This ensures collision detection works from all sides
    return { 
      x: this.state.position.x,
      y: this.state.position.y
    };
  }

  getSize(): { width: number; height: number } {
    return { ...this.state.size };
  }

  getVelocity(): Point {
    return { ...this.state.velocity };
  }

  isJumping(): boolean {
    return this.state.isJumping;
  }

  getWeaponLevel(): number {
    return this.state.weaponLevel;
  }

  setWeaponLevel(level: number): void {
    const newLevel = Math.min(level, weaponData.length - 1);
    this.state.weaponLevel = newLevel;
    // Update player's ASCII art based on the new weapon and direction
    this.updateSpriteDirection();
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

  private updateSpriteDirection(): void {
    // Get current weapon data
    const currentWeapon = weaponData[this.state.weaponLevel];
    
    // Define the ASCII representation with appropriate weapon positioning
    let spriteText;
    
    if (this.facingDirection === 'left') {
      // Weapon on left side - character holds weapon out to the left
      spriteText = ` o \n${currentWeapon.ascii}-|\n ^ \n/ \\`;
      
      // Flip the text horizontally
      this.text.scale.x = -1;
      
      // Adjust position to account for the flip
      this.text.position.x = this.text.width;
    } else {
      // Weapon on right side - character holds weapon out to the right
      spriteText = ` o \n|-${currentWeapon.ascii}\n ^ \n/ \\`;
      
      // Reset text scale and position
      this.text.scale.x = 1;
      this.text.position.x = 0;
    }
    
    // Update the text content
    this.text.text = spriteText;
  }
}