import { COLORS } from '../constants.js';

export const WEAPONS = {
    magicBolt: {
        id: 'magicBolt', name: 'Magic Bolt', description: 'Fires fast piercing bolts', type: 'projectile',
        baseDamage: 20, cooldown: 0.6, speed: 400, size: 6, pierce: 0, lifetime: 1.5, color: '#00ffcc', maxLevel: 8,
    },
    fireAura: {
        id: 'fireAura', name: 'Fire Aura', description: 'Burns enemies near you', type: 'aura',
        baseDamage: 40, cooldown: 0.8, radius: 90, radiusPerLevel: 12, color: '#ff5522', maxLevel: 8,
    },
    lightningChain: {
        id: 'lightningChain', name: 'Lightning', description: 'Chains through enemies', type: 'chain',
        baseDamage: 30, cooldown: 1.0, chainRange: 180, chainCount: 3, color: '#ffee44', maxLevel: 8,
    },
    iceShards: {
        id: 'iceShards', name: 'Ice Shards', description: 'Shoots a cone of ice', type: 'projectile',
        baseDamage: 14, cooldown: 0.9, speed: 320, size: 5, pierce: 0, lifetime: 1.8, projectileCount: 3, color: '#66ddff', maxLevel: 8,
    },
    boomerang: {
        id: 'boomerang', name: 'Boomerang', description: 'Orbiting blades', type: 'orbit',
        baseDamage: 35, cooldown: 0.3, orbitRadius: 100, orbitSpeed: 3, orbitSpeedPerLevel: 0.4, color: '#ffaa00', maxLevel: 8,
    },
    poisonCloud: {
        id: 'poisonCloud', name: 'Poison Cloud', description: 'Periodic poison nova', type: 'nova',
        baseDamage: 22, cooldown: 2.5, radius: 70, radiusPerLevel: 10, color: '#55ff55', maxLevel: 8,
    },
};
