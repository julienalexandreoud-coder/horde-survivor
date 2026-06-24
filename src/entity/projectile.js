export class Projectile {
    constructor(x, y, vx, vy, damage, radius, color, pierce, lifetime) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.radius = radius;
        this.color = color;
        this.pierce = pierce || 0;
        this.lifetime = lifetime;
        this.alive = true;
    }

    update(dt, worldSize) {
        if (!this.alive) return;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (
            this.x < -this.radius ||
            this.y < -this.radius ||
            this.x > worldSize.width + this.radius ||
            this.y > worldSize.height + this.radius
        ) {
            this.alive = false;
            return;
        }

        this.lifetime -= dt;
        if (this.lifetime <= 0) {
            this.alive = false;
        }
    }

    onHit() {
        this.pierce -= 1;
        if (this.pierce < 0) {
            this.alive = false;
        }
        return this.alive;
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

    getDamage() {
        return this.damage;
    }
}
