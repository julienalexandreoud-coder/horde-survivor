import { PICKUP_LIFETIME } from '../constants.js';

export class Pickup {
    constructor(x, y, type) {
        this.x = x + (Math.random() - 0.5) * 12;
        this.y = y + (Math.random() - 0.5) * 12;
        this.type = type;
        this.alive = true;
        this.lifetime = PICKUP_LIFETIME;
        this.radius = type === 'xp' ? 6 : 9;
        this.value = 1;
        this.magnetActive = false;
        this._spawnTime = 0;
    }

    update(dt) {
        if (!this.alive) return;

        this._spawnTime += dt;
        this.lifetime -= dt;

        if (this.lifetime <= 0) {
            this.alive = false;
        }
    }

    getBobOffset() {
        return Math.sin(this._spawnTime * 3) * 2;
    }

    collect() {
        this.alive = false;
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

    getType() {
        return this.type;
    }

    getValue() {
        return this.value;
    }
}
