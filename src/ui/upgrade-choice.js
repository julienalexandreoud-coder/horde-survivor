import { COLORS } from '../constants.js';

export class UpgradeChoice {
  constructor(renderer, input) {
    this.renderer = renderer;
    this.input = input;
    this.onSelect = null;
    this.selectedIndex = 0;
    this._prevKeys = new Set();
  }

  update(dt) {
    const keys = ['Digit1', 'Digit2', 'Digit3'];
    for (let i = 0; i < keys.length; i++) {
      if (this.input.isPressed(keys[i])) {
        if (this.onSelect) this.onSelect(i);
        return;
      }
    }

    if (this.input.isPressed('ArrowLeft')) {
      this.selectedIndex = (this.selectedIndex - 1 + 3) % 3;
    }
    if (this.input.isPressed('ArrowRight')) {
      this.selectedIndex = (this.selectedIndex + 1) % 3;
    }
    if (this.input.isPressed('Space') || this.input.isPressed('Enter')) {
      if (this.onSelect) this.onSelect(this.selectedIndex);
    }
  }

  render(choices) {
    const w = this.renderer.getWidth();
    const h = this.renderer.getHeight();
    const cx = Math.floor(w / 2);

    this.renderer.rect(0, 0, w, h, {
      fillStyle: 'rgba(0, 0, 0, 0.5)',
    });

    this._drawTitle(cx, h);

    if (!choices || choices.length < 3) return;

    const cardW = 240;
    const cardH = 320;
    const gap = 20;
    const totalW = cardW * 3 + gap * 2;
    const startX = cx - Math.floor(totalW / 2);
    const cardY = Math.floor(h * 0.26);

    for (let i = 0; i < 3; i++) {
      const x = startX + i * (cardW + gap);
      this._drawCard(x, cardY, cardW, cardH, choices[i], i, i === this.selectedIndex);
    }
  }

  _drawTitle(cx, h) {
    const titleY = Math.floor(h * 0.12);
    const pulse = 1 + Math.sin(Date.now() * 0.004) * 0.04;

    this.renderer.text(cx + 3, titleY + 3, 'LEVEL UP!', {
      fontSize: Math.floor(40 * pulse),
      fillStyle: COLORS.glowYellow,
      textAlign: 'center',
      textBaseline: 'middle',
    });

    this.renderer.text(cx, titleY, 'LEVEL UP!', {
      fontSize: Math.floor(40 * pulse),
      fillStyle: COLORS.title,
      textAlign: 'center',
      textBaseline: 'middle',
    });
  }

  _drawCard(x, y, w, h, choice, index, selected) {
    const borderColor = selected ? COLORS.cardBorderSelected : COLORS.cardBorder;

    this.renderer.rect(x, y, w, h, {
      fillStyle: COLORS.cardBg,
      strokeStyle: borderColor,
      lineWidth: selected ? 3 : 1.5,
      cornerRadius: 10,
    });

    if (selected) {
      this.renderer.rect(x - 2, y - 2, w + 4, h + 4, {
        fillStyle: 'transparent',
        strokeStyle: COLORS.glowGold,
        lineWidth: 4,
        cornerRadius: 12,
      });
    }

    const isWeapon = choice.category === 'new_weapon' || choice.category === 'weapon_upgrade';
    const categoryColor = isWeapon ? COLORS.weapon : COLORS.statUp;
    const categoryLabel = isWeapon ? 'WEAPON' : 'STAT';

    const cx = x + Math.floor(w / 2);

    this.renderer.rect(x + 12, y + 16, 70, 22, {
      fillStyle: categoryColor,
      cornerRadius: 4,
    });
    this.renderer.text(x + 12 + 35, y + 16 + 11, categoryLabel, {
      fontSize: 11,
      fillStyle: COLORS.white,
      textAlign: 'center',
      textBaseline: 'middle',
    });

    if (isWeapon && choice.weaponColor) {
      const iconR = 16;
      this.renderer.circle(cx, y + 82, iconR, {
        fillStyle: 'rgba(0,0,0,0.4)',
      });
      this.renderer.circle(cx, y + 82, iconR - 2, {
        fillStyle: choice.weaponColor,
      });
    }

    this.renderer.text(cx, y + 126, choice.name || '', {
      fontSize: 20,
      fillStyle: COLORS.white,
      textAlign: 'center',
      textBaseline: 'middle',
    });

    this._drawDescription(cx, y + 156, w - 30, choice.description || '');

    if (isWeapon && choice.currentLevel !== undefined) {
      const lvlText = `Lv.${choice.currentLevel} -> Lv.${choice.currentLevel + 1}`;
      this.renderer.text(cx, y + 218, lvlText, {
        fontSize: 14,
        fillStyle: categoryColor,
        textAlign: 'center',
        textBaseline: 'middle',
      });
    } else if (!isWeapon && choice.currentLevel !== undefined) {
      const lvlText = `Lv.${choice.currentLevel} -> Lv.${choice.currentLevel + 1}`;
      this.renderer.text(cx, y + 218, lvlText, {
        fontSize: 14,
        fillStyle: COLORS.statUp,
        textAlign: 'center',
        textBaseline: 'middle',
      });
    }

    this.renderer.text(cx, y + h - 36, `[${index + 1}]`, {
      fontSize: 22,
      fillStyle: selected ? COLORS.title : COLORS.mutedLight,
      textAlign: 'center',
      textBaseline: 'middle',
    });
  }

  _drawDescription(cx, startY, maxWidth, text) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      if (testLine.length > 28) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      this.renderer.text(cx, startY + i * 18, lines[i], {
        fontSize: 13,
        fillStyle: COLORS.whiteAlpha,
        textAlign: 'center',
        textBaseline: 'top',
      });
    }
  }
}
