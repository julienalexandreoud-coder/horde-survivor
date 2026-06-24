export class Input {
    constructor(canvas) {
        this.canvas = canvas;
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
        canvas.addEventListener('mousemove', this._onMouseMove);
    }

    _onKeyDown(e) {
        const code = e.code || e.key;
        if (!this._keys.get(code)) {
            this._pressedThisFrame.add(code);
        }
        this._keys.set(code, true);
        if (e.code !== e.key) {
            if (!this._keys.get(e.key)) this._pressedThisFrame.add(e.key);
            this._keys.set(e.key, true);
        }
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Space'].includes(code) ||
            ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Space'].includes(e.key)) {
            e.preventDefault();
        }
    }

    _onKeyUp(e) {
        const code = e.code || e.key;
        this._keys.set(code, false);
        this._releasedThisFrame.add(code);
        if (e.code !== e.key) {
            this._keys.set(e.key, false);
            this._releasedThisFrame.add(e.key);
        }
    }

    _onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = rect.width ? this.canvas.width / rect.width : 1;
        const scaleY = rect.height ? this.canvas.height / rect.height : 1;
        this.mouseX = (e.clientX - rect.left) * scaleX;
        this.mouseY = (e.clientY - rect.top) * scaleY;
        this.mouseMoved = true;
    }

    isDown(key) { return !!this._keys.get(key); }
    isPressed(key) { return this._pressedThisFrame.has(key); }
    wasReleased(key) { return this._releasedThisFrame.has(key); }

    getDirection() {
        let x = 0, y = 0;
        if (this.isDown('KeyW') || this.isDown('ArrowUp') || this.isDown('w')) y -= 1;
        if (this.isDown('KeyS') || this.isDown('ArrowDown') || this.isDown('s')) y += 1;
        if (this.isDown('KeyA') || this.isDown('ArrowLeft') || this.isDown('a')) x -= 1;
        if (this.isDown('KeyD') || this.isDown('ArrowRight') || this.isDown('d')) x += 1;
        const len = Math.sqrt(x * x + y * y);
        if (len > 0) { x /= len; y /= len; }
        return { x, y };
    }

    getAimAngle(playerX, playerY, camera) {
        if (!this.mouseMoved) return null;
        const camX = camera ? camera.x : 0;
        const camY = camera ? camera.y : 0;
        const wx = this.mouseX + camX;
        const wy = this.mouseY + camY;
        const dx = wx - playerX;
        const dy = wy - playerY;
        return Math.atan2(dy, dx);
    }

    getMouseWorldPos(camera) {
        return {
            x: this.mouseX + (camera ? camera.x : 0),
            y: this.mouseY + (camera ? camera.y : 0),
        };
    }

    update() {
        this._pressedThisFrame.clear();
        this._releasedThisFrame.clear();
        this.mouseMoved = false;
    }

    destroy() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
        this.canvas.removeEventListener('mousemove', this._onMouseMove);
    }
}
