import { COLORS } from '../constants.js';

export class MainMenu {
  constructor(renderer, input) {
    this.renderer = renderer;
    this.input = input;
    this.time = 0;
    this.onPlay = null;
    this.onShop = null;
  }

  update(dt) {
    this.time += dt;

    if (this.input.isPressed('Space') || this.input.isPressed('Enter')) {
      if (this.onPlay) this.onPlay();
    }
    if (this.input.isPressed('KeyS')) {
      if (this.onShop) this.onShop();
    }
  }

  render(coinBalance, bestStats) {
    const w = this.renderer.getWidth();
    const h = this.renderer.getHeight();
    const cx = Math.floor(w / 2);

    this._drawBackground(w, h);

    this._drawTitle(cx, h);

    this._drawSubtitle(cx, h);

    this._drawPrompt(cx, h);

    this._drawCoinBalance(coinBalance, cx, h);

    this._drawBestStats(bestStats, cx, h);

    this._drawControls(cx, h);
  }

  _drawBackground(w, h) {
    const ctx = this.renderer.ctx;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a0a2e');
    grad.addColorStop(0.5, '#16213e');
    grad.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 30; i++) {
      const y = Math.floor(Math.random() * h);
      const x = Math.floor(Math.random() * w);
      ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.06})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }

  _drawTitle(cx, h) {
    const titleY = Math.floor(h * 0.22);
    const ctx = this.renderer.ctx;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,212,255,0.4)';
    ctx.shadowBlur = 16;
    ctx.fillText('HORDE SURVIVOR', cx, titleY);
    ctx.shadowBlur = 0;
    ctx.fillText('HORDE SURVIVOR', cx, titleY);
  }

  _drawSubtitle(cx, h) {
    const subY = Math.floor(h * 0.34);
    this.renderer.text(cx, subY, 'A Bullet Heaven Game', {
      fontSize: 18,
      fillStyle: 'rgba(255,255,255,0.7)',
      textAlign: 'center',
    });
  }

  _drawPrompt(cx, h) {
    const promptY = Math.floor(h * 0.52);
    const alpha = 0.5 + Math.sin(this.time * 3) * 0.4;

    this.renderer.text(cx, promptY, 'Press SPACE to Play', {
      fontSize: 22,
      fillStyle: `rgba(255, 255, 255, ${Math.max(0.1, alpha)})`,
      textAlign: 'center',
    });

    this.renderer.text(cx, promptY + 32, 'Press S for Shop', {
      fontSize: 15,
      fillStyle: `rgba(255, 255, 255, ${Math.max(0.1, alpha - 0.2)})`,
      textAlign: 'center',
    });
  }

  _drawCoinBalance(coinBalance, cx, h) {
    const coinY = Math.floor(h * 0.66);
    const coins = coinBalance || 0;
    this.renderer.text(cx, coinY, `Coins: ${coins}`, {
      fontSize: 20,
      fillStyle: '#ffd700',
      textAlign: 'center',
    });
  }

  _drawBestStats(bestStats, cx, h) {
    const statsY = Math.floor(h * 0.72);
    const stats = bestStats || { wave: 0, kills: 0, time: 0 };
    const t = Math.floor(stats.time || 0);
    const mins = Math.floor(t / 60);
    const secs = String(Math.floor(t % 60)).padStart(2, '0');

    this.renderer.text(cx, statsY, `Best: Wave ${stats.wave} | Kills: ${stats.kills} | Time: ${mins}:${secs}`, {
      fontSize: 14,
      fillStyle: 'rgba(255,255,255,0.5)',
      textAlign: 'center',
    });
  }

  _drawControls(cx, h) {
    const ctrlY = Math.floor(h * 0.88);
    this.renderer.text(cx, ctrlY, 'WASD to move | Mouse to aim', {
      fontSize: 12,
      fillStyle: 'rgba(255,255,255,0.35)',
      textAlign: 'center',
    });
  }
}
