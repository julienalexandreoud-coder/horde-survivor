import { COLORS } from '../constants.js';

export class HUD {
  constructor(renderer) {
    this.renderer = renderer;
  }

  render(player, gameStats, wave, gameTime) {
    const w = this.renderer.getWidth();
    const h = this.renderer.getHeight();
    const margin = 12;

    this._drawHealthBar(player, margin);
    this._drawTimerWave(gameTime, wave, w);
    this._drawXpBar(player, w, h, margin);
    this._drawWeapons(player, w, margin);
    this._drawCoinCount(gameStats, margin);
    this._drawKillCount(gameStats, margin);
  }

  _drawHealthBar(player, margin) {
    const barX = margin;
    const barY = margin + 4;
    const barW = 200;
    const barH = 16;

    this.renderer.rect(barX - 2, barY - 2, barW + 4, barH + 4, {
      fillStyle: COLORS.uiPanel,
      cornerRadius: 3,
    });

    this.renderer.drawHealthBar(barX, barY, barW, barH, player.hp, player.maxHp);

    const hpText = `${Math.ceil(player.hp)}/${player.maxHp}`;
    this.renderer.text(barX + barW / 2, barY + barH + 10, hpText, {
      fontSize: 13,
      fillStyle: COLORS.white,
      textAlign: 'center',
    });

    const lvlText = `Lv.${player.level}`;
    this.renderer.text(barX + barW + 12, barY + barH / 2 + 1, lvlText, {
      fontSize: 16,
      fillStyle: COLORS.title,
      textAlign: 'left',
      textBaseline: 'middle',
    });
  }

  _drawTimerWave(gameTime, wave, canvasW) {
    const centerX = Math.floor(canvasW / 2);
    const y = 18;

    const t = Math.floor(gameTime);
    const mins = Math.floor(t / 60);
    const secs = String(Math.floor(t % 60)).padStart(2, '0');
    const timeStr = `${mins}:${secs}`;

    this.renderer.text(centerX, y, timeStr, {
      fontSize: 20,
      fillStyle: COLORS.white,
      textAlign: 'center',
    });

    this.renderer.text(centerX, y + 22, `Wave ${wave.current}/${wave.max}`, {
      fontSize: 14,
      fillStyle: COLORS.warning,
      textAlign: 'center',
    });
  }

  _drawXpBar(player, canvasW, canvasH, margin) {
    const barX = margin;
    const barW = canvasW - margin * 2;
    const barH = 8;
    const barY = canvasH - margin - barH;

    this.renderer.rect(barX - 1, barY - 1, barW + 2, barH + 2, {
      fillStyle: COLORS.uiPanel,
      cornerRadius: 2,
    });

    this.renderer.rect(barX, barY, barW, barH, {
      fillStyle: COLORS.xpBg,
      cornerRadius: 2,
    });

    if (player.xpToNext > 0) {
      const fillW = (player.xp / player.xpToNext) * barW;
      this.renderer.rect(barX, barY, Math.max(fillW, 0), barH, {
        fillStyle: COLORS.xp,
        cornerRadius: 2,
      });
    }

    const xpText = `${player.xp}/${player.xpToNext} XP`;
    this.renderer.text(barX + barW / 2, barY - 5, xpText, {
      fontSize: 11,
      fillStyle: COLORS.whiteAlpha,
      textAlign: 'center',
    });
  }

  _drawWeapons(player, canvasW, margin) {
    const weapons = player.weapons || [];
    if (weapons.length === 0) return;

    const radius = 16;
    const diameter = radius * 2;
    const spacing = 8;
    const startX = canvasW - margin - radius;
    const startY = margin + 100;

    for (let i = 0; i < Math.min(weapons.length, 6); i++) {
      const weapon = weapons[i];
      const x = startX;
      const y = startY + i * (diameter + spacing);

      this.renderer.circle(x, y, radius, {
        fillStyle: COLORS.uiPanel,
      });

      this.renderer.circle(x, y, radius - 2, {
        fillStyle: weapon.color || COLORS.weapon,
      });

      this.renderer.text(x, y + 1, String(weapon.level || 1), {
        fontSize: 13,
        fillStyle: COLORS.white,
        textAlign: 'center',
        textBaseline: 'middle',
      });
    }
  }

  _drawCoinCount(gameStats, margin) {
    const coins = gameStats.coinsEarned || 0;
    const text = `${coins} coins`;
    this.renderer.text(margin, 56, text, {
      fontSize: 15,
      fillStyle: COLORS.gold,
      textAlign: 'left',
    });
  }

  _drawKillCount(gameStats, margin) {
    const kills = gameStats.kills || 0;
    this.renderer.text(margin, 74, `${kills} kills`, {
      fontSize: 12,
      fillStyle: COLORS.whiteAlpha,
      textAlign: 'left',
    });
  }
}
