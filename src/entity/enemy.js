import { ENEMY_TYPES } from '../constants.js';

export class Enemy {
    constructor(typeKey, x, y) {
        const typeData = ENEMY_TYPES[typeKey];
        if (!typeData) {
            throw new Error('Unknown enemy type: ' + typeKey);
        }

        this.typeKey = typeKey;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = typeData.radius;
        this.speed = typeData.speed;
        this.maxHp = typeData.hp;
        this.hp = typeData.hp;
        this.damage = typeData.damage;
        this.xp = typeData.xp;
        this.coins = typeData.coins;
        this.color = typeData.color;
        this.strokeColor = typeData.strokeColor;
        this.alive = true;
        this.shouldShoot = false;
        this._prevX = x;
        this._prevY = y;

        if (typeData.attackRange !== undefined) {
            this.attackRange = typeData.attackRange;
            this.attackCooldown = typeData.attackCooldown;
            this.attackCooldownTimer = typeData.attackCooldown;
            this.projectileSpeed = typeData.projectileSpeed;
            this.projectileRadius = typeData.projectileRadius;
        }

        if (typeData.projectileCount !== undefined) {
            this.projectileCount = typeData.projectileCount;
        }
    }

    update(dt, playerPos) {
        if (!this.alive) return;

        this._prevX = this.x;
        this._prevY = this.y;

        const dx = playerPos.x - this.x;
        const dy = playerPos.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;
        } else {
            this.vx = 0;
            this.vy = 0;
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        this.shouldShoot = false;

        if (this.attackRange !== undefined) {
            if (dist > this.attackRange * 0.5 && dist <= this.attackRange) {
                this.attackCooldownTimer -= dt;
                if (this.attackCooldownTimer <= 0) {
                    this.shouldShoot = true;
                    this.attackCooldownTimer = this.attackCooldown;
                }
            }
        }
    }

    takeDamage(amount) {
        if (!this.alive) return false;

        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
            return true;
        }
        return false;
    }

    isAlive() {
        return this.alive;
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    getRadius() {
        return this.radius;
    }

    getXPValue() {
        return this.xp;
    }

    getCoinValue() {
        return this.coins;
    }

    getProjectileCount() {
        return this.projectileCount || 0;
    }
}
