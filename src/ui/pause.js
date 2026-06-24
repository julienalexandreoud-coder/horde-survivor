import { COLORS } from '../constants.js';

export class PauseMenu {
  constructor(renderer, input) {
    this.renderer = renderer;
    this.input = input;
  }

  update() {
    if (this.input.isPressed('Escape')) {
      return 'resume';
    }
    if (this.input.isPressed('KeyM')) {
      return 'menu';
    }
    return null;
  }

  render() {
    const w = this.renderer.getWidth();
    const h = this.renderer.getHeight();
    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);

    this.renderer.rect(0, 0, w, h, {
      fillStyle: COLORS.darkOverlay,
    });

    this.renderer.text(cx, cy - 60, 'PAUSED', {
      fontSize: 48,
      fillStyle: COLORS.white,
      textAlign: 'center',
      textBaseline: 'middle',
    });

    this.renderer.text(cx, cy - 8, 'Press ESC to Resume', {
      fontSize: 22,
      fillStyle: COLORS.whiteAlpha,
      textAlign: 'center',
      textBaseline: 'middle',
    });

    this.renderer.text(cx, cy + 36, 'Press M for Menu (lose progress)', {
      fontSize: 16,
      fillStyle: COLORS.warning,
      textAlign: 'center',
      textBaseline: 'middle',
    });
  }
}
