import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from './constants.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.width = CANVAS_WIDTH;
        this.height = CANVAS_HEIGHT;
        this._handleResize = this._handleResize.bind(this);
        window.addEventListener('resize', this._handleResize);
        this._handleResize();
    }

    _handleResize() {
        const aspect = CANVAS_WIDTH / CANVAS_HEIGHT;
        const windowAspect = window.innerWidth / window.innerHeight;
        let dw, dh;
        if (windowAspect > aspect) { dh = window.innerHeight; dw = dh * aspect; }
        else { dw = window.innerWidth; dh = dw / aspect; }
        this.canvas.style.width = dw + 'px';
        this.canvas.style.height = dh + 'px';
    }

    getWidth() { return this.width; }
    getHeight() { return this.height; }

    clear() {
        const ctx = this.ctx;
        ctx.fillStyle = COLORS.background;
        ctx.fillRect(0, 0, this.width, this.height);
    }

    circle(x, y, radius, color, strokeColor, strokeWidth) {
        const ctx = this.ctx;
        let opts = {};
        if (typeof color === 'object' && color !== null) {
            opts = color;
        } else {
            opts.fillStyle = color;
            opts.strokeStyle = strokeColor;
            opts.lineWidth = strokeWidth;
        }
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0, radius), 0, Math.PI * 2);
        if (opts.fillStyle) { ctx.fillStyle = opts.fillStyle; ctx.fill(); }
        if (opts.strokeStyle) { ctx.strokeStyle = opts.strokeStyle; ctx.lineWidth = opts.lineWidth || 1; ctx.stroke(); }
    }

    rect(x, y, w, h, color) {
        const ctx = this.ctx;
        let opts = {};
        if (typeof color === 'object' && color !== null) {
            opts = color;
        } else {
            opts.fillStyle = color;
        }
        if (opts.cornerRadius) {
            const r = opts.cornerRadius;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.arcTo(x + w, y, x + w, y + r, r);
            ctx.lineTo(x + w, y + h - r);
            ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
            ctx.lineTo(x + r, y + h);
            ctx.arcTo(x, y + h, x, y + h - r, r);
            ctx.lineTo(x, y + r);
            ctx.arcTo(x, y, x + r, y, r);
            ctx.closePath();
        }
        ctx.save();
        if (opts.fillStyle && opts.fillStyle !== 'transparent') { ctx.fillStyle = opts.fillStyle; ctx.fill(); }
        if (opts.strokeStyle) { ctx.strokeStyle = opts.strokeStyle; ctx.lineWidth = opts.lineWidth || 1; ctx.stroke(); }
        if (opts.globalAlpha !== undefined) { ctx.globalAlpha = opts.globalAlpha; }
        ctx.restore();
        if (!opts.cornerRadius && opts.fillStyle && opts.fillStyle !== 'transparent') {
            ctx.fillStyle = opts.fillStyle;
            ctx.fillRect(x, y, w, h);
        }
        if (!opts.cornerRadius && opts.strokeStyle) {
            ctx.strokeStyle = opts.strokeStyle;
            ctx.lineWidth = opts.lineWidth || 1;
            ctx.strokeRect(x, y, w, h);
        }
    }

    text(text, x, y, size, color, align) {
        const ctx = this.ctx;
        let opts = {};
        if (typeof size === 'object' && size !== null) {
            opts = size;
        } else {
            opts.fontSize = size;
            opts.fillStyle = color;
            opts.textAlign = align;
        }
        ctx.font = (opts.fontStyle ? opts.fontStyle + ' ' : '') + (opts.fontSize || 14) + 'px "Courier New", monospace';
        ctx.fillStyle = opts.fillStyle || '#fff';
        ctx.textAlign = opts.textAlign || 'left';
        ctx.textBaseline = opts.textBaseline || 'middle';
        ctx.fillText(text, x, y);
    }

    line(x1, y1, x2, y2, color, width) {
        const ctx = this.ctx;
        let opts = {};
        if (typeof color === 'object' && color !== null) {
            opts = color;
        } else {
            opts.strokeStyle = color;
            opts.lineWidth = width;
        }
        ctx.strokeStyle = opts.strokeStyle || '#fff';
        ctx.lineWidth = opts.lineWidth || 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    drawHealthBar(x, y, w, h, current, maxVal) {
        const ctx = this.ctx;
        let pct, col, bg;
        if (typeof current === 'number' && typeof maxVal === 'number') {
            pct = Math.max(0, Math.min(1, current / maxVal));
            col = COLORS.hpBar;
            bg = COLORS.hpBg;
        } else {
            pct = Math.max(0, Math.min(1, current));
            col = maxVal || COLORS.hpBar;
            bg = undefined;
        }
        ctx.fillStyle = bg || COLORS.hpBg;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = col || COLORS.hpBar;
        ctx.fillRect(x, y, w * pct, h);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
    }

    drawParticle(x, y, color, size, alpha) {
        const ctx = this.ctx;
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.fillStyle = color;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
        ctx.globalAlpha = 1;
    }

    glowCircle(x, y, radius, color, alpha) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.shadowColor = color;
        ctx.shadowBlur = radius * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawDamageNumber(x, y, damage, color) {
        const ctx = this.ctx;
        const s = 14 + Math.min(damage * 0.5, 10);
        ctx.font = 'bold ' + s + 'px "Courier New", monospace';
        ctx.fillStyle = color || COLORS.damageNumber;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(damage), x, y);
    }
}
