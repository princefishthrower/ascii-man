import { WeaponData } from '../../types';

export const weaponData: WeaponData[] = [
  {
    name: "Rock",
    ascii: ".",
    projectile: ".",
    damage: 1,
    cooldown: 15,
    speed: 8,
    pattern: "single"
  },
  {
    name: "Pistol",
    ascii: "/-",
    projectile: ".",
    damage: 2,
    cooldown: 12,
    speed: 10,
    pattern: "single"
  },
  {
    name: "Shotgun",
    ascii: "/==",
    projectile: ".:.",
    damage: 3,
    cooldown: 25,
    speed: 9,
    pattern: "spread"
  },
  {
    name: "Machine Gun",
    ascii: "/==---",
    projectile: ".",
    damage: 5,
    cooldown: 5,
    speed: 12,
    pattern: "stream"
  },
  {
    name: "Ray Gun",
    ascii: "/+=={",
    projectile: "*",
    damage: 10,
    cooldown: 10,
    speed: 15,
    pattern: "stream"
  }
];