import { PLAYER, COLORS } from '../constants.js';

const DEFAULT_WEAPON = {
    id: 'magicBolt',
    level: 1,
    damage: 20,
    cooldown: 0.6,
    currentCooldown: 0,
    projectileCount: 1,
    pierce: 0,
    size: 1,
    speed: 400,
    duration: 1.5,
};

export class Player {
    constructor(x, y, characterData) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;

        const hpBonus = characterData.hpBonus || 0;
        const speedBonus = characterData.speedBonus || 0;
        const damageBonus = characterData.damageBonus || 0;

        this.maxHP = PLAYER.baseMaxHP + hpBonus;
        this.hp = this.maxHP;
        this.level = 1;
        this.speed = PLAYER.baseSpeed * (1 + speedBonus);
        this.damageMultiplier = 1 + damageBonus;
        this.pickupRange = PLAYER.pickupRange;
        this.xpGainMultiplier = 0;
        this.coinGainMultiplier = 0;
        this.regen = PLAYER.baseRegen;
        this.armor = 0;
        this.invincibilityTimer = 0;
        this.alive = true;
        this.radius = PLAYER.radius;
        this.aimAngle = 0;

        const weaponData = characterData.startingWeapon
            ? { ...DEFAULT_WEAPON, id: characterData.startingWeapon }
            : { ...DEFAULT_WEAPON };
        this.weapons = [weaponData];

        this._time = 0;
    }

    update(dt, input, worldSize, enemies) {
        if (!this.alive) return;

        this._time += dt;

        const dir = input.getDirection();
        this.vx = dir.x * this.speed;
        this.vy = dir.y * this.speed;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (this.x - this.radius < 0) this.x = this.radius;
        if (this.y - this.radius < 0) this.y = this.radius;
        if (this.x + this.radius > worldSize.width) this.x = worldSize.width - this.radius;
        if (this.y + this.radius > worldSize.height) this.y = worldSize.height - this.radius;

        const aimAngle = input.getAimAngle(this.x, this.y);
        if (aimAngle !== null) {
            this.aimAngle = aimAngle;
        } else if (enemies && enemies.length > 0) {
            let nearestDist = 500;
            let nearestAngle = this.aimAngle;
            for (const enemy of enemies) {
                if (!enemy.isAlive()) continue;
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestAngle = Math.atan2(dy, dx);
                }
            }
            this.aimAngle = nearestAngle;
        }

        if (this.regen > 0) {
            this.hp = Math.min(this.maxHP, this.hp + this.regen * dt);
        }

        if (this.invincibilityTimer > 0) {
            this.invincibilityTimer -= dt;
        }

        for (const weapon of this.weapons) {
            if (weapon.currentCooldown > 0) {
                weapon.currentCooldown -= dt;
            }
        }
    }

    takeDamage(amount) {
        if (!this.alive || this.invincibilityTimer > 0) return 0;

        const reducedAmount = amount * (1 - this.armor);
        this.hp -= reducedAmount;

        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
        } else {
            this.invincibilityTimer = PLAYER.invincibilityTime;
        }

        return reducedAmount;
    }

    heal(amount) {
        if (!this.alive) return;
        this.hp = Math.min(this.maxHP, this.hp + amount);
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

    addXP(amount, xpMultiplier) {
        const actual = amount * (1 + xpMultiplier * 0.1);
        this._xp = (this._xp || 0) + actual;
        return this._xp;
    }

    getXP() {
        return this._xp || 0;
    }

    getStats() {
        return {
            hp: this.hp,
            maxHP: this.maxHP,
            level: this.level,
            speed: this.speed,
            damageMultiplier: this.damageMultiplier,
            pickupRange: this.pickupRange,
            armor: this.armor,
            regen: this.regen,
        };
    }

    applyPermanentUpgrade(type, level) {
        switch (type) {
            case 'maxHp':
                this.maxHP = PLAYER.baseMaxHP + level * 20;
                this.hp = Math.min(this.hp + 20, this.maxHP);
                break;
            case 'damage':
                this.damageMultiplier = 1 + level * 0.1;
                break;
            case 'moveSpeed':
            case 'speed':
                this.speed = PLAYER.baseSpeed * (1 + level * 0.05);
                break;
            case 'xpGain':
                this.xpGainMultiplier = level;
                break;
            case 'coinGain':
                this.coinGainMultiplier = level;
                break;
            case 'pickupRange':
                this.pickupRange = PLAYER.pickupRange * (1 + level * 0.1);
                break;
            case 'regen':
                this.regen = level;
                break;
            case 'armor':
                this.armor = level * 0.05;
                break;
        }
    }

    addWeapon(weaponData) {
        this.weapons.push({ ...weaponData, currentCooldown: 0 });
    }

    upgradeWeapon(weaponId) {
        const weapon = this.weapons.find(w => w.id === weaponId);
        if (weapon) {
            weapon.level += 1;
            weapon.damage = Math.floor(weapon.damage * 1.15);
            weapon.cooldown = Math.max(0.1, weapon.cooldown * 0.9);
            weapon.projectileCount += weapon.level % 3 === 0 ? 1 : 0;
            weapon.pierce += weapon.level % 4 === 0 ? 1 : 0;
            weapon.size = Math.min(2, weapon.size + 0.1);
        }
    }

    getAimAngle() {
        return this.aimAngle;
    }
}
