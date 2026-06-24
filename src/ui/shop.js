import { COLORS, SHOP_ITEMS } from '../constants.js';

export class ShopUI {
  constructor(renderer, input) {
    this.renderer = renderer;
    this.input = input;
    this.onBuy = null;
    this.onBack = null;
    this.selectedIndex = 0;
    this.cols = 3;
  }

  update(dt, coinBalance, purchasedLevels) {
    const items = SHOP_ITEMS;
    const rows = Math.ceil(items.length / this.cols);
    const maxIndex = items.length - 1;
    const purchased = purchasedLevels || {};

    if (this.input.isPressed('ArrowRight')) {
      this.selectedIndex = (this.selectedIndex + 1) % items.length;
    }
    if (this.input.isPressed('ArrowLeft')) {
      this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
    }
    if (this.input.isPressed('ArrowDown')) {
      this.selectedIndex = (this.selectedIndex + this.cols) % items.length;
    }
    if (this.input.isPressed('ArrowUp')) {
      this.selectedIndex = (this.selectedIndex - this.cols + items.length) % items.length;
    }

    if (this.input.isPressed('Space') || this.input.isPressed('Enter')) {
      const item = items[this.selectedIndex];
      const currentLevel = purchased[item.id] || 0;
      if (currentLevel < item.maxLevel) {
        const cost = this._getCost(item, currentLevel);
        if (coinBalance >= cost && this.onBuy) {
          this.onBuy(item.id);
        }
      }
    }

    if (this.input.isPressed('Escape') || this.input.isPressed('KeyB')) {
      if (this.onBack) this.onBack();
    }
  }

  render(coinBalance, purchasedLevels) {
    const w = this.renderer.getWidth();
    const h = this.renderer.getHeight();
    const cx = Math.floor(w / 2);
    const purchased = purchasedLevels || {};

    this.renderer.rect(0, 0, w, h, {
      fillStyle: 'rgba(5, 5, 15, 0.92)',
    });

    this._drawTitle(cx, h);
    this._drawCoinBalance(coinBalance, cx, h);
    this._drawGrid(purchased, coinBalance, w, h);
    this._drawFooter(cx, h);
  }

  _drawTitle(cx, h) {
    const titleY = Math.floor(h * 0.07);

    this.renderer.text(cx + 2, titleY + 2, 'SHOP', {
      fontSize: 40,
      fillStyle: COLORS.glowYellow,
      textAlign: 'center',
      textBaseline: 'middle',
    });

    this.renderer.text(cx, titleY, 'SHOP', {
      fontSize: 40,
      fillStyle: COLORS.title,
      textAlign: 'center',
      textBaseline: 'middle',
    });
  }

  _drawCoinBalance(coinBalance, cx, h) {
    const coinY = Math.floor(h * 0.13);
    this.renderer.text(cx, coinY, `Your Coins: ${coinBalance}`, {
      fontSize: 20,
      fillStyle: COLORS.gold,
      textAlign: 'center',
    });
  }

  _drawGrid(purchased, coinBalance, canvasW, canvasH) {
    const items = SHOP_ITEMS;
    const cardW = 220;
    const cardH = 180;
    const gapX = 24;
    const gapY = 16;
    const rows = Math.ceil(items.length / this.cols);
    const gridW = this.cols * cardW + (this.cols - 1) * gapX;
    const gridH = rows * cardH + (rows - 1) * gapY;
    const startX = Math.floor(canvasW / 2) - Math.floor(gridW / 2);
    const startY = Math.floor(canvasH * 0.38) - Math.floor(gridH / 2);

    for (let i = 0; i < items.length; i++) {
      const row = Math.floor(i / this.cols);
      const col = i % this.cols;
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);
      const item = items[i];
      const currentLevel = purchased[item.id] || 0;
      const isMaxed = currentLevel >= item.maxLevel;
      const cost = this._getCost(item, currentLevel);
      const canAfford = coinBalance >= cost && !isMaxed;
      const isSelected = i === this.selectedIndex;

      this._drawItemCard(x, y, cardW, cardH, item, currentLevel, cost, isMaxed, canAfford, isSelected);
    }
  }

  _drawItemCard(x, y, w, h, item, currentLevel, cost, isMaxed, canAfford, isSelected) {
    let borderColor = COLORS.cardBorder;
    if (isSelected) borderColor = COLORS.cardBorderSelected;
    if (isMaxed) borderColor = COLORS.muted;

    this.renderer.rect(x, y, w, h, {
      fillStyle: isSelected && !isMaxed ? 'rgba(25, 25, 40, 0.9)' : 'rgba(12, 12, 22, 0.85)',
      strokeStyle: borderColor,
      lineWidth: isSelected ? 2.5 : 1.5,
      cornerRadius: 8,
    });

    if (isSelected && !isMaxed) {
      this.renderer.rect(x - 2, y - 2, w + 4, h + 4, {
        fillStyle: 'transparent',
        strokeStyle: COLORS.glowGold,
        lineWidth: 3,
        cornerRadius: 10,
      });
    }

    const cx = x + Math.floor(w / 2);
    const mutedColor = isMaxed ? COLORS.muted : COLORS.white;

    this.renderer.circle(cx, y + 28, 16, {
      fillStyle: isMaxed ? COLORS.muted : item.color,
    });

    this.renderer.rect(x + 14, y + 56, w - 28, 1, {
      fillStyle: COLORS.cardBorder,
    });

    this.renderer.text(cx, y + 70, item.name, {
      fontSize: 17,
      fillStyle: mutedColor,
      textAlign: 'center',
      textBaseline: 'middle',
    });

    this.renderer.text(cx, y + 92, item.description, {
      fontSize: 11,
      fillStyle: isMaxed ? COLORS.muted : COLORS.whiteAlpha,
      textAlign: 'center',
      textBaseline: 'middle',
    });

    this.renderer.text(cx, y + 118, `Lv. ${currentLevel}/${item.maxLevel}`, {
      fontSize: 13,
      fillStyle: mutedColor,
      textAlign: 'center',
      textBaseline: 'middle',
    });

    this._drawProgressDots(x + 14, y + 132, w - 28, currentLevel, item.maxLevel, isMaxed);

    const costText = isMaxed ? 'MAX' : `${cost} coins`;
    const costColor = isMaxed ? COLORS.muted : canAfford ? COLORS.gold : COLORS.danger;
    this.renderer.text(cx, y + h - 18, costText, {
      fontSize: 14,
      fillStyle: costColor,
      textAlign: 'center',
      textBaseline: 'middle',
    });
  }

  _drawProgressDots(x, y, totalW, current, max, isMaxed) {
    const dotR = 3;
    const dotD = dotR * 2;
    const spacing = 4;
    const maxFit = Math.floor(totalW / (dotD + spacing));
    const dots = Math.min(max, maxFit);
    const totalDotsW = dots * dotD + (dots - 1) * spacing;
    const startX = x + Math.floor((totalW - totalDotsW) / 2);

    for (let i = 0; i < dots; i++) {
      const dotX = startX + i * (dotD + spacing) + dotR;
      const filled = i < current;
      this.renderer.circle(dotX, y, dotR, {
        fillStyle: filled ? (isMaxed ? COLORS.muted : COLORS.xp) : 'rgba(255,255,255,0.15)',
      });
    }
  }

  _drawFooter(cx, h) {
    const footerY = Math.floor(h * 0.92);
    this.renderer.text(cx, footerY, 'Arrow Keys to Navigate | SPACE to Buy | ESC/B to go back', {
      fontSize: 13,
      fillStyle: COLORS.mutedLight,
      textAlign: 'center',
    });
  }

  _getCost(item, currentLevel) {
    return Math.floor(item.baseCost * Math.pow(item.costScale, currentLevel));
  }
}
