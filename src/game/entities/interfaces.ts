import Enemy from './Enemy';
import PowerUp from './PowerUp';
import Projectile from './Projectile';

// Define entity interfaces with guaranteed isActive property
export interface IEntityBase {
  isActive?: boolean;
}

export interface IEnemy extends Enemy, IEntityBase {}
export interface IPowerUp extends PowerUp, IEntityBase {}
export interface IProjectile extends Projectile, IEntityBase {}
