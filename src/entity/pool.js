import { Enemy } from './enemy.js';
import { Projectile } from './projectile.js';
import { Pickup } from './pickup.js';
import { COLORS } from '../constants.js';

const MAX_PLAYER_PROJECTILES = 50;
const MAX_ENEMY_PROJECTILES = 50;

export class EnemyPool {
    constructor() {
        this.enemies = [];
        this.playerProjectiles = [];
        this.enemyProjectiles = [];
        this.pickups = [];
    }

    get _enemies() { return this.enemies; }

    spawnEnemy(typeKey, x, y) {
        const enemy = new Enemy(typeKey, x, y);
        this.enemies.push(enemy);
        return enemy;
    }

    spawnPlayerProjectile(x, y, vx, vy, damage, radius, color, pierce, lifetime) {
        if (this.getPooledCount('player') >= MAX_PLAYER_PROJECTILES) {
            return null;
        }
        const proj = new Projectile(x, y, vx, vy, damage, radius, color, pierce, lifetime);
        this.playerProjectiles.push(proj);
        return proj;
    }

    spawnEnemyProjectile(x, y, vx, vy, damage, radius, color, pierce, lifetime) {
        if (this.getPooledCount('enemy') >= MAX_ENEMY_PROJECTILES) {
            return null;
        }
        const proj = new Projectile(x, y, vx, vy, damage, radius, color, pierce, lifetime);
        this.enemyProjectiles.push(proj);
        return proj;
    }

    spawnPickup(x, y, type) {
        const pickup = new Pickup(x, y, type);
        this.pickups.push(pickup);
        return pickup;
    }

    getActiveEnemies() {
        return this.enemies.filter(e => e.isAlive());
    }

    getActivePlayerProjectiles() {
        return this.playerProjectiles.filter(p => p.isAlive());
    }

    getActiveEnemyProjectiles() {
        return this.enemyProjectiles.filter(p => p.isAlive());
    }

    getActivePickups() {
        return this.pickups.filter(p => p.isAlive());
    }

    updateAll(dt, player, worldSize) {
        const playerPos = player.getPosition();
        const playerPickupRange = player.pickupRange;
        const magnetRange = playerPickupRange * 2;

        for (const enemy of this.enemies) {
            if (!enemy.isAlive()) continue;
            enemy.update(dt, playerPos);

            if (enemy.shouldShoot) {
                enemy.shouldShoot = false;
                const dx = playerPos.x - enemy.x;
                const dy = playerPos.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const ndx = dist > 0 ? dx / dist : 1;
                const ndy = dist > 0 ? dy / dist : 0;

                const count = enemy.getProjectileCount();
                if (count > 0) {
                    const angleStep = (Math.PI * 2) / count;
                    for (let i = 0; i < count; i++) {
                        const angle = angleStep * i;
                        const pvx = Math.cos(angle) * enemy.projectileSpeed;
                        const pvy = Math.sin(angle) * enemy.projectileSpeed;
                        this.spawnEnemyProjectile(
                            enemy.x, enemy.y,
                            pvx, pvy,
                            enemy.damage,
                            enemy.projectileRadius,
                            COLORS.projectile_enemy,
                            0,
                            5
                        );
                    }
                } else if (enemy.projectileSpeed !== undefined) {
                    this.spawnEnemyProjectile(
                        enemy.x, enemy.y,
                        ndx * enemy.projectileSpeed,
                        ndy * enemy.projectileSpeed,
                        enemy.damage,
                        enemy.projectileRadius,
                        COLORS.projectile_enemy,
                        0,
                        5
                    );
                }
            }
        }

        for (const proj of this.playerProjectiles) {
            if (!proj.isAlive()) continue;
            proj.update(dt, worldSize);
        }

        for (const proj of this.enemyProjectiles) {
            if (!proj.isAlive()) continue;
            proj.update(dt, worldSize);
        }

        for (const pickup of this.pickups) {
            if (!pickup.isAlive()) continue;
            pickup.update(dt);

            if (pickup.magnetActive) {
                const pdx = playerPos.x - pickup.x;
                const pdy = playerPos.y - pickup.y;
                const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
                if (pdist < magnetRange && pdist > 2) {
                    const pullSpeed = 200;
                    pickup.x += (pdx / pdist) * pullSpeed * dt;
                    pickup.y += (pdy / pdist) * pullSpeed * dt;
                }
            }
        }
    }

    removeDead() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (!this.enemies[i].isAlive()) {
                this.enemies.splice(i, 1);
            }
        }
        for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
            if (!this.playerProjectiles[i].isAlive()) {
                this.playerProjectiles.splice(i, 1);
            }
        }
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            if (!this.enemyProjectiles[i].isAlive()) {
                this.enemyProjectiles.splice(i, 1);
            }
        }
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            if (!this.pickups[i].isAlive()) {
                this.pickups.splice(i, 1);
            }
        }
    }

    clear() {
        this.enemies.length = 0;
        this.playerProjectiles.length = 0;
        this.enemyProjectiles.length = 0;
        this.pickups.length = 0;
    }

    getEnemyCount() {
        let count = 0;
        for (const enemy of this.enemies) {
            if (enemy.isAlive()) count++;
        }
        return count;
    }

    getPooledCount(type) {
        if (type === 'player') {
            let count = 0;
            for (const p of this.playerProjectiles) {
                if (p.isAlive()) count++;
            }
            return count;
        }
        if (type === 'enemy') {
            let count = 0;
            for (const p of this.enemyProjectiles) {
                if (p.isAlive()) count++;
            }
            return count;
        }
        return 0;
    }
}
