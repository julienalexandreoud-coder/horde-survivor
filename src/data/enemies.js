import { ENEMY_TYPES } from '../constants.js';

export function getEnemyTypesForWave(wave) {
    const types = ['basic'];
    if (wave >= 3) types.push('fast');
    if (wave >= 5) types.push('tank');
    if (wave >= 7) types.push('ranged');
    if (wave >= 9) types.push('swarm');
    return types;
}

export function getRandomEnemyType(availableTypes) {
    const weights = { basic: 40, fast: 20, tank: 15, ranged: 15, swarm: 10 };
    const total = availableTypes.reduce((sum, t) => sum + (weights[t] || 0), 0);
    let r = Math.random() * total;
    for (const t of availableTypes) {
        r -= (weights[t] || 0);
        if (r <= 0) return t;
    }
    return availableTypes[0];
}
