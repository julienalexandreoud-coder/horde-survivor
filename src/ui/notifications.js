export class NotificationSystem {
  constructor(renderer) {
    this.renderer = renderer;
    this.notifications = [];
  }

  addDamageNumber(x, y, amount, color) {
    this.notifications.push({
      text: String(Math.floor(amount)),
      x,
      y,
      color: color || '#E74C3C',
      lifetime: 0,
      maxLifetime: 0.8,
      velocity: 40,
      type: 'damage',
    });
  }

  addPickupText(x, y, text, color) {
    this.notifications.push({
      text,
      x,
      y,
      color: color || '#2ECC71',
      lifetime: 0,
      maxLifetime: 1.0,
      velocity: 40,
      type: 'pickup',
    });
  }

  addMessage(text, color, duration) {
    this.notifications.push({
      text,
      x: null,
      y: null,
      color: color || '#FFFFFF',
      lifetime: 0,
      maxLifetime: duration || 2.0,
      velocity: 0,
      type: 'message',
    });
  }

  update(dt) {
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      const n = this.notifications[i];
      n.lifetime += dt;

      if (n.lifetime >= n.maxLifetime) {
        this.notifications.splice(i, 1);
        continue;
      }

      if (n.type !== 'message') {
        n.y -= n.velocity * dt;
      }
    }
  }

  render(camera) {
    const camX = camera ? camera.x || 0 : 0;
    const camY = camera ? camera.y || 0 : 0;
    const screenW = this.renderer.getWidth();
    const screenH = this.renderer.getHeight();

    for (const n of this.notifications) {
      const progress = n.lifetime / n.maxLifetime;
      let alpha = 1;
      if (progress > 0.5) {
        alpha = 1 - (progress - 0.5) / 0.5;
      }
      alpha = Math.max(0, Math.min(1, alpha));

      let scale = 1;
      if (progress < 0.1 && n.type !== 'message') {
        scale = 0.6 + (progress / 0.1) * 0.4;
      }

      const fontSize = n.type === 'message' ? 28 : n.type === 'damage' ? 16 : 14;
      const fillStyle = this._rgbaFromColor(n.color, alpha);

      let drawX;
      let drawY;

      if (n.type === 'message') {
        drawX = Math.floor(screenW / 2);
        drawY = Math.floor(screenH * 0.3);
      } else {
        drawX = n.x - camX;
        drawY = n.y - camY;

        if (drawX < -100 || drawX > screenW + 100 || drawY < -100 || drawY > screenH + 100) {
          continue;
        }
      }

      this.renderer.text(drawX, drawY, n.text, {
        fontSize: Math.floor(fontSize * scale),
        fillStyle,
        textAlign: 'center',
        textBaseline: 'middle',
      });
    }
  }

  clear() {
    this.notifications = [];
  }

  _rgbaFromColor(hex, alpha) {
    if (hex.startsWith('rgba') || hex.startsWith('rgb')) {
      return hex.replace(/[\d.]+\)$/, `${alpha})`).replace(/rgba/, 'rgba');
    }

    let r, g, b;
    if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    } else if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else {
      return hex;
    }

    return `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
  }
}
