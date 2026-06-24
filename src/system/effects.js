import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from '../constants.js';

const MAX_PARTICLES = 500;

export class EffectsSystem {
    constructor(game) {
        this.game = game;
        this.particles = [];
        this._shakeIntensity = 0;
        this._shakeDuration = 0;
        this._shakeElapsed = 0;
        this._flashAlpha = 0;
        this._flashDuration = 0;
        this._flashElapsed = 0;
        this._shakeOffset = { x: 0, y: 0 };
    }

    addParticles(x, y, color, count, speed, lifetime) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= MAX_PARTICLES) break;

            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * speed;
            const vx = Math.cos(angle) * spd;
            const vy = Math.sin(angle) * spd;
            const size = 1.5 + Math.random() * 2.5;
            const life = lifetime * (0.6 + Math.random() * 0.4);

            this.particles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                life: life,
                maxLife: life,
                color: color,
                size: size,
            });
        }
    }

    screenShake(intensity, duration) {
        this._shakeIntensity = intensity;
        this._shakeDuration = duration;
        this._shakeElapsed = 0;
    }

    damageFlash(duration) {
        this._flashAlpha = 1;
        this._flashDuration = duration;
        this._flashElapsed = 0;
    }

    levelUpEffect(x, y) {
        for (let i = 0; i < 25; i++) {
            if (this.particles.length >= MAX_PARTICLES) break;

            const angle = Math.random() * Math.PI * 2;
            const spd = 40 + Math.random() * 120;
            const vx = Math.cos(angle) * spd;
            const vy = Math.sin(angle) * spd;
            const life = 0.6 + Math.random() * 0.6;
            const color = Math.random() < 0.5 ? '#ffd700' : '#ffffff';
            const size = 2 + Math.random() * 4;

            this.particles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                life: life,
                maxLife: life,
                color: color,
                size: size,
            });
        }
    }

    deathEffect(x, y, color) {
        const c = color || '#ff4466';
        for (let i = 0; i < 18; i++) {
            if (this.particles.length >= MAX_PARTICLES) break;

            const angle = Math.random() * Math.PI * 2;
            const spd = 30 + Math.random() * 100;
            const vx = Math.cos(angle) * spd;
            const vy = Math.sin(angle) * spd;
            const life = 0.3 + Math.random() * 0.4;
            const size = 2 + Math.random() * 3;

            this.particles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                life: life,
                maxLife: life,
                color: c,
                size: size,
            });
        }
    }

    bossDeathEffect(x, y) {
        for (let i = 0; i < 40; i++) {
            if (this.particles.length >= MAX_PARTICLES) break;

            const angle = Math.random() * Math.PI * 2;
            const spd = 20 + Math.random() * 80;
            const vx = Math.cos(angle) * spd;
            const vy = Math.sin(angle) * spd;
            const life = 0.8 + Math.random() * 1.2;
            const color = Math.random() < 0.5 ? '#ffd700' : '#ffec99';
            const size = 3 + Math.random() * 5;

            this.particles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                life: life,
                maxLife: life,
                color: color,
                size: size,
            });
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        if (this._shakeElapsed < this._shakeDuration) {
            this._shakeElapsed += dt;
            const progress = this._shakeElapsed / this._shakeDuration;
            const intensity = this._shakeIntensity * (1 - progress);
            this._shakeOffset.x = (Math.random() - 0.5) * intensity * 2;
            this._shakeOffset.y = (Math.random() - 0.5) * intensity * 2;
        } else {
            this._shakeOffset.x = 0;
            this._shakeOffset.y = 0;
            this._shakeIntensity = 0;
        }

        if (this._flashElapsed < this._flashDuration) {
            this._flashElapsed += dt;
            const progress = this._flashElapsed / this._flashDuration;
            this._flashAlpha = 1 - progress;
        } else {
            this._flashAlpha = 0;
        }
    }

    render(ctx) {
        const ox = this._shakeOffset.x;
        const oy = this._shakeOffset.y;

        if (ox !== 0 || oy !== 0) {
            ctx.save();
            ctx.translate(ox, oy);
        }

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            const alpha = p.life / p.maxLife;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
            ctx.restore();
        }

        if (ox !== 0 || oy !== 0) {
            ctx.restore();
        }
    }

    renderUI(ctx) {
        if (this._flashAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = this._flashAlpha * 0.3;
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.restore();
        }
    }

    getShakeOffset() {
        return { x: this._shakeOffset.x, y: this._shakeOffset.y };
    }
}
