import { COLORS, PICKUP_RADIUS, PICKUP_LIFETIME } from '../constants.js';

const CELL_SIZE = 80;

export class CollisionSystem {
    constructor(game) {
        this.game = game;
        this.cellSize = CELL_SIZE;
        this.grid = new Map();
    }

    clear() {
        this.grid.clear();
    }

    getCellKey(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        return col + '_' + row;
    }

    getNeighborCells(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        const cells = [];
        for (let dc = -1; dc <= 1; dc++) {
            for (let dr = -1; dr <= 1; dr++) {
                cells.push((col + dc) + '_' + (row + dr));
            }
        }
        return cells;
    }

    circleCircle(x1, y1, r1, x2, y2, r2) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        const dist = r1 + r2;
        return (dx * dx + dy * dy) < (dist * dist);
    }

    insert(entity, type) {
        const x = entity.x;
        const y = entity.y;
        const radius = entity.radius || 6;

        const minCol = Math.floor((x - radius) / this.cellSize);
        const maxCol = Math.floor((x + radius) / this.cellSize);
        const minRow = Math.floor((y - radius) / this.cellSize);
        const maxRow = Math.floor((y + radius) / this.cellSize);

        for (let col = minCol; col <= maxCol; col++) {
            for (let row = minRow; row <= maxRow; row++) {
                const key = col + '_' + row;
                let cell = this.grid.get(key);
                if (!cell) {
                    cell = [];
                    this.grid.set(key, cell);
                }
                cell.push({ entity, type, x, y, radius });
            }
        }
    }

    update(dt) {
        const player = this.game.player;
        if (!player || !player.alive) return { kills: 0, damageDealt: 0 };

        this.clear();

        this.insert(player, 'player');

        this._insertEnemies();
        this._insertProjectiles(this.game.projectiles.player, 'playerProjectile');
        this._insertProjectiles(this.game.projectiles.enemy, 'enemyProjectile');
        this._insertPickups();

        return this._checkAllCollisions(player);
    }

    _insertEnemies() {
        const enemies = this.game.enemies;
        if (!enemies) return;

        if (enemies._enemies) {
            for (const e of enemies._enemies) {
                if (e && e.alive) this.insert(e, 'enemy');
            }
        } else if (enemies.length !== undefined) {
            for (let i = 0; i < enemies.length; i++) {
                if (enemies[i] && enemies[i].alive) this.insert(enemies[i], 'enemy');
            }
        } else {
            for (const e of enemies) {
                if (e && e.alive) this.insert(e, 'enemy');
            }
        }
    }

    _insertProjectiles(projectiles, type) {
        for (let i = 0; i < projectiles.length; i++) {
            const p = projectiles[i];
            if (p && p.alive) {
                this.insert(p, type);
            }
        }
    }

    _insertPickups() {
        const pickups = this.game.pool ? this.game.pool.pickups : this.game.pickups;
        for (let i = 0; i < pickups.length; i++) {
            const p = pickups[i];
            if (p && p.isAlive()) {
                this.insert(p, 'pickup');
            }
        }
    }

    _checkAllCollisions(player) {
        const stats = { kills: 0, damageDealt: 0 };
        const processed = { playerProjectile: new Set(), enemyProjectile: new Set() };

        for (const cell of this.grid.values()) {
            const playerItems = [];
            const enemies = [];
            const playerProjectiles = [];
            const enemyProjectiles = [];
            const pickups = [];

            for (const item of cell) {
                switch (item.type) {
                    case 'player':
                        playerItems.push(item);
                        break;
                    case 'enemy':
                        if (item.entity.alive) enemies.push(item);
                        break;
                    case 'playerProjectile':
                        if (item.entity.alive) playerProjectiles.push(item);
                        break;
                    case 'enemyProjectile':
                        if (item.entity.alive) enemyProjectiles.push(item);
                        break;
                    case 'pickup':
                        if (item.entity.isAlive()) pickups.push(item);
                        break;
                }
            }

            for (const pItem of playerItems) {
                const px = pItem.x;
                const py = pItem.y;
                const pr = pItem.radius;

                for (const eItem of enemies) {
                    if (this.circleCircle(px, py, pr, eItem.x, eItem.y, eItem.radius)) {
                        if (player.invincibilityTimer <= 0) {
                            const dmg = player.takeDamage(eItem.entity.damage);
                            if (dmg > 0) {
                                const pushAngle = Math.atan2(py - eItem.y, px - eItem.x);
                                eItem.entity.x -= Math.cos(pushAngle) * 10;
                                eItem.entity.y -= Math.sin(pushAngle) * 10;
                            }
                        }
                    }
                }

                for (const epItem of enemyProjectiles) {
                    if (this.circleCircle(px, py, pr, epItem.x, epItem.y, epItem.radius)) {
                        if (player.invincibilityTimer <= 0) {
                            player.takeDamage(epItem.entity.damage || 10);
                        }
                        if (typeof epItem.entity.onHit === 'function') {
                            epItem.entity.onHit();
                        }
                    }
                }

                for (const pickItem of pickups) {
                    if (!pickItem.entity.isAlive()) continue;
                    const dx = pickItem.x - px;
                    const dy = pickItem.y - py;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= player.pickupRange) {
                        this._collectPickup(pickItem.entity, player);
                    }
                }
            }

            for (const ppItem of playerProjectiles) {
                for (const eItem of enemies) {
                    if (this.circleCircle(ppItem.x, ppItem.y, ppItem.radius, eItem.x, eItem.y, eItem.radius)) {
                        const projectile = ppItem.entity;
                        const enemy = eItem.entity;
                        const dmg = projectile.damage || 10;
                        const killed = enemy.takeDamage(dmg);
                        stats.damageDealt += dmg;

                        if (typeof projectile.onHit === 'function') {
                            projectile.onHit();
                        }

                        if (killed) {
                            stats.kills++;
                            this._spawnPickup(enemy, 'xp');
                            if (Math.random() < 0.3) {
                                this._spawnPickup(enemy, 'coin');
                            }
                            if (this.game.effects) {
                                this.game.effects.deathEffect(
                                    enemy.x,
                                    enemy.y,
                                    enemy.color || COLORS.enemy_basic
                                );
                            }
                        }

                        if (!projectile.alive) break;
                    }
                }
            }
        }

        return stats;
    }

    _collectPickup(pickup, player) {
        if (pickup.collected !== undefined) pickup.collected = true;
        if (typeof pickup.collect === 'function') pickup.collect();
        const type = pickup.type || (typeof pickup.getType === 'function' ? pickup.getType() : 'xp');
        const value = pickup.value || (typeof pickup.getValue === 'function' ? pickup.getValue() : 1);
        if (type === 'xp') {
            player.addXP(value, player.xpGainMultiplier);
        } else if (type === 'coin') {
            this.game.stats.coins += value;
        }
    }

    _spawnPickup(enemy, type) {
        if (this.game.pool) {
            this.game.pool.spawnPickup(enemy.x, enemy.y, type);
        }
        if (type === 'xp' && this.game.effects) {
            this.game.effects.deathEffect(enemy.x, enemy.y, enemy.color || COLORS.enemy_basic);
        }
    }
}
