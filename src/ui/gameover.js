import { COLORS } from '../constants.js';

export class GameOverScreen {
  constructor(renderer, input) {
    this.renderer = renderer;
    this.input = input;
    this.time = 0;
    this.canRevive = false;
    this.canDoubleCoins = false;
    this.onRetry = null;
    this.onMenu = null;
    this.onRevive = null;
    this.onDoubleCoins = null;
  }

  update(dt, stats) {
    this.time += dt;

    if (this.input.isPressed('Space') || this.input.isPressed('Enter')) {
      if (this.onRetry) this.onRetry();
    }

    if (this.input.isPressed('KeyM')) {
      if (this.onMenu) this.onMenu();
    }

    if (this.canRevive && this.input.isPressed('KeyR')) {
      if (this.onRevive) this.onRevive();
    }

    if (this.canDoubleCoins && this.input.isPressed('KeyD')) {
      if (this.onDoubleCoins) this.onDoubleCoins();
    }
  }

  render(stats) {
    const w = this.renderer.getWidth();
    const h = this.renderer.getHeight();
    const cx = Math.floor(w / 2);

    this.renderer.rect(0, 0, w, h, {
      fillStyle: COLORS.darkOverlay,
    });

    this._drawTitle(cx, h);

    this._drawStatsPanel(stats, cx, h);

    const bottomY = this._drawOptions(cx, h, stats);
  }

  _drawTitle(cx, h) {
    const titleY = Math.floor(h * 0.15);

    this.renderer.text(cx + 3, titleY + 3, 'GAME OVER', {
      fontSize: 48,
      fillStyle: `rgba(200, 30, 30, 0.4)`,
      textAlign: 'center',
      textBaseline: 'middle',
    });

    this.renderer.text(cx, titleY, 'GAME OVER', {
      fontSize: 48,
      fillStyle: COLORS.danger,
      textAlign: 'center',
      textBaseline: 'middle',
    });
  }

  _drawStatsPanel(stats, cx, h) {
    const panelW = 340;
    const panelH = 180;
    const panelX = cx - Math.floor(panelW / 2);
    const panelY = Math.floor(h * 0.26);

    this.renderer.rect(panelX, panelY, panelW, panelH, {
      fillStyle: COLORS.uiPanelLight,
      cornerRadius: 8,
    });

    const s = stats || {};
    const t = Math.floor(s.timeSurvived || 0);
    const mins = Math.floor(t / 60);
    const secs = String(Math.floor(t % 60)).padStart(2, '0');

    const rows = [
      { label: 'Time Survived', value: `${mins}:${secs}` },
      { label: 'Wave Reached', value: `Wave ${s.wave || 0}` },
      { label: 'Enemies Killed', value: String(s.kills || 0) },
      { label: 'Damage Dealt', value: String(Math.floor(s.damageDealt || 0)) },
      { label: 'Coins Earned', value: String(s.coinsEarned || 0), color: COLORS.gold },
    ];

    const rowHeight = 28;
    const startY = panelY + 20;

    for (let i = 0; i < rows.length; i++) {
      const rowY = startY + i * rowHeight;
      const row = rows[i];

      this.renderer.text(panelX + 18, rowY, row.label, {
        fontSize: 15,
        fillStyle: COLORS.whiteAlpha,
        textAlign: 'left',
        textBaseline: 'top',
      });

      this.renderer.text(panelX + panelW - 18, rowY, row.value, {
        fontSize: 15,
        fillStyle: row.color || COLORS.white,
        textAlign: 'right',
        textBaseline: 'top',
      });
    }
  }

  _drawOptions(cx, h, stats) {
    const startY = Math.floor(h * 0.58);
    const lineSpacing = 32;

    if (this.canRevive) {
      this.renderer.text(cx, startY, 'Press R to Revive (Watch Ad)', {
        fontSize: 18,
        fillStyle: COLORS.gold,
        textAlign: 'center',
      });
    }

    if (this.canDoubleCoins) {
      const y = this.canRevive ? startY + lineSpacing : startY;
      this.renderer.text(cx, y, 'Press D for 2x Coins (Watch Ad)', {
        fontSize: 18,
        fillStyle: COLORS.gold,
        textAlign: 'center',
      });
    }

    let offset = 0;
    if (this.canRevive) offset++;
    if (this.canDoubleCoins) offset++;

    const retryY = startY + offset * lineSpacing;
    this.renderer.text(cx, retryY, 'Press SPACE to Retry', {
      fontSize: 20,
      fillStyle: COLORS.white,
      textAlign: 'center',
    });

    this.renderer.text(cx, retryY + lineSpacing, 'Press M for Menu', {
      fontSize: 16,
      fillStyle: COLORS.mutedLight,
      textAlign: 'center',
    });
  }
}
