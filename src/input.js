export class Input {
    constructor() {
        this._keys = new Map();
        this._pressedThisFrame = new Set();
        this._releasedThisFrame = new Set();

        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseMoved = false;

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);

        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
        window.addEventListener('mousemove', this._onMouseMove);
    }

    _onKeyDown(e) {
        if (!this._keys.get(e.code)) {
            this._pressedThisFrame.add(e.code);
            this._pressedThisFrame.add(e.key);
        }
        this._keys.set(e.code, true);
        this._keys.set(e.key, true);

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
    }

    _onKeyUp(e) {
        this._keys.set(e.code, false);
        this._keys.set(e.key, false);
        this._releasedThisFrame.add(e.code);
        this._releasedThisFrame.add(e.key);
    }

    _onMouseMove(e) {
        const rect = e.target.getBoundingClientRect();
        const scaleX = rect.width ? e.target.width / rect.width : 1;
        const scaleY = rect.height ? e.target.height / rect.height : 1;
        this.mouseX = (e.clientX - rect.left) * scaleX;
        this.mouseY = (e.clientY - rect.top) * scaleY;
        this.mouseMoved = true;
    }

    isDown(key) { return !!this._keys.get(key); }
    isPressed(key) { return this._pressedThisFrame.has(key); }
    wasReleased(key) { return this._releasedThisFrame.has(key); }

    getDirection() {
        let x = 0, y = 0;
        if (this.isDown('KeyW') || this.isDown('ArrowUp')) y -= 1;
        if (this.isDown('KeyS') || this.isDown('ArrowDown')) y += 1;
        if (this.isDown('KeyA') || this.isDown('ArrowLeft')) x -= 1;
        if (this.isDown('KeyD') || this.isDown('ArrowRight')) x += 1;
        const len = Math.sqrt(x * x + y * y);
        if (len > 0) { x /= len; y /= len; }
        return { x, y };
    }

    getAimAngle(playerX, playerY) {
        if (!this.mouseMoved) return null;
        const dx = this.mouseX - playerX;
        const dy = this.mouseY - playerY;
        return Math.atan2(dy, dx);
    }

    getMouseWorldPos(camera) {
        return { x: this.mouseX + camera.x, y: this.mouseY + camera.y };
    }

    update() {
        this._pressedThisFrame.clear();
        this._releasedThisFrame.clear();
        this.mouseMoved = false;
    }

    destroy() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
        window.removeEventListener('mousemove', this._onMouseMove);
    }
}
