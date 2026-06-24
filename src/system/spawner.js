import { ENEMY_TYPES, WAVE_DURATION, MAX_WAVES, BOSS_INTERVAL_WAVES } from '../constants.js';

const MAX_ACTIVE_ENEMIES = 200;
const BASE_SPAWN_RATE = 0.5;

const WAVE_COMPOSITION = [
    { minWave: 1, types: ['basic'] },
    { minWave: 3, types: ['basic', 'fast'] },
    { minWave: 5, types: ['basic', 'fast', 'tank'] },
    { minWave: 7, types: ['basic', 'fast', 'tank', 'ranged'] },
    { minWave: 9, types: ['basic', 'fast', 'tank', 'ranged', 'swarm'] },
];

export class Spawner {
    constructor(game) {
        this.game = game;
        this.reset();
    }

    reset() {
        this.currentWave = 0;
        this.waveTimer = 0;
        this.enemiesSpawnedThisWave = 0;
        this.difficultyMultiplier = 1;
        this._spawnAccumulator = 0;
        this._bossAlive = false;
        this._waveStarted = false;
    }

    update(dt) {
        if (!this.game.enemies) return;

        if (!this._waveStarted) {
            this.currentWave = 1;
            this.waveTimer = 0;
            this.difficultyMultiplier = 1;
            this._waveStarted = true;
        }

        this.waveTimer += dt;

        if (this.waveTimer >= WAVE_DURATION && this.currentWave < MAX_WAVES) {
            this.currentWave++;
            this.waveTimer = 0;
            this.enemiesSpawnedThisWave = 0;
            this.difficultyMultiplier = 1 + (this.currentWave - 1) * 0.1;
        }

        if (this._bossAlive) {
            this._bossAlive = this._hasAliveBoss();
        }

        const spawnRate = BASE_SPAWN_RATE * (1 + this.currentWave * 0.15);
        this._spawnAccumulator += spawnRate * dt;

        const worldW = this.game.worldWidth;
        const worldH = this.game.worldHeight;

        while (this._spawnAccumulator >= 1) {
            const activeCount = this._countActiveEnemies();
            if (activeCount >= MAX_ACTIVE_ENEMIES) break;

            const type = this._chooseEnemyType();
            const pos = this._getEdgePosition(worldW, worldH);
            const enemy = this.game.enemies.spawnEnemy(type, pos.x, pos.y);

            if (enemy) {
                enemy.hp *= this.difficultyMultiplier;
                enemy.maxHp *= this.difficultyMultiplier;
                enemy.damage *= this.difficultyMultiplier;
                this.enemiesSpawnedThisWave++;
            }

            this._spawnAccumulator -= 1;
        }

        if (this.currentWave >= BOSS_INTERVAL_WAVES &&
            this.currentWave % BOSS_INTERVAL_WAVES === 0 &&
            !this._bossAlive) {
            this._spawnBoss(worldW, worldH);
        }
    }

    _spawnBoss(worldW, worldH) {
        const pos = this._getEdgePosition(worldW, worldH);
        const boss = this.game.enemies.spawnEnemy('boss', pos.x, pos.y);
        if (boss) {
            boss.hp *= this.difficultyMultiplier;
            boss.maxHp *= this.difficultyMultiplier;
            boss.damage *= this.difficultyMultiplier;
            this._bossAlive = true;
        }
    }

    _chooseEnemyType() {
        let available = WAVE_COMPOSITION[0].types;

        for (let i = WAVE_COMPOSITION.length - 1; i >= 0; i--) {
            if (this.currentWave >= WAVE_COMPOSITION[i].minWave) {
                available = WAVE_COMPOSITION[i].types;
                break;
            }
        }

        const weights = { basic: 50, fast: 20, tank: 15, ranged: 10, swarm: 15 };
        const typedWeights = {};
        let totalWeight = 0;
        for (const type of available) {
            const w = weights[type] || 10;
            typedWeights[type] = w;
            totalWeight += w;
        }

        let roll = Math.random() * totalWeight;
        for (const type of available) {
            roll -= typedWeights[type];
            if (roll <= 0) return type;
        }
        return available[0];
    }

    _getEdgePosition(worldW, worldH) {
        const margin = 30;
        const side = Math.floor(Math.random() * 4);

        switch (side) {
            case 0: return { x: margin + Math.random() * (worldW - margin * 2), y: margin };
            case 1: return { x: margin + Math.random() * (worldW - margin * 2), y: worldH - margin };
            case 2: return { x: margin, y: margin + Math.random() * (worldH - margin * 2) };
            case 3: return { x: worldW - margin, y: margin + Math.random() * (worldH - margin * 2) };
            default: return { x: worldW / 2, y: margin };
        }
    }

    _countActiveEnemies() {
        let count = 0;
        const enemies = this.game.enemies;
        if (enemies._enemies) {
            for (const e of enemies._enemies) {
                if (e && e.alive) count++;
            }
        } else if (enemies.length !== undefined) {
            for (let i = 0; i < enemies.length; i++) {
                if (enemies[i] && enemies[i].alive) count++;
            }
        } else {
            for (const e of enemies) {
                if (e && e.alive) count++;
            }
        }
        return count;
    }

    _hasAliveBoss() {
        const enemies = this.game.enemies;
        if (enemies._enemies) {
            for (const e of enemies._enemies) {
                if (e && e.alive && e.typeKey === 'boss') return true;
            }
        } else if (enemies.length !== undefined) {
            for (let i = 0; i < enemies.length; i++) {
                if (enemies[i] && enemies[i].alive && enemies[i].typeKey === 'boss') return true;
            }
        } else {
            for (const e of enemies) {
                if (e && e.alive && e.typeKey === 'boss') return true;
            }
        }
        return false;
    }

    getWave() {
        return this.currentWave;
    }

    getDifficultyMultiplier() {
        return this.difficultyMultiplier;
    }

    isBossWave() {
        return this.currentWave >= BOSS_INTERVAL_WAVES &&
            this.currentWave % BOSS_INTERVAL_WAVES === 0;
    }
}
