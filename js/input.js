// Tracks input state so game logic never touches raw DOM events.
// Exposes intent methods (isLeft/isRight/isFiring) rather than key codes,
// so a future touch/mouse input source can satisfy the same interface.
export class InputHandler {
  constructor() {
    this.keys = new Set();
    this.firePressed = false; // edge-triggered, for start/restart prompts

    window.addEventListener('keydown', (e) => this._onKeyDown(e));
    window.addEventListener('keyup', (e) => this._onKeyUp(e));
  }

  _onKeyDown(e) {
    this.keys.add(e.code);
    if (e.code === 'Space') {
      this.firePressed = true;
      e.preventDefault();
    }
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
      e.preventDefault();
    }
  }

  _onKeyUp(e) {
    this.keys.delete(e.code);
  }

  isLeft() {
    return this.keys.has('ArrowLeft') || this.keys.has('KeyA');
  }

  isRight() {
    return this.keys.has('ArrowRight') || this.keys.has('KeyD');
  }

  isFiring() {
    return this.keys.has('Space');
  }

  // Returns true once per keypress, then resets. Used for menu confirm.
  consumeFirePressed() {
    const pressed = this.firePressed;
    this.firePressed = false;
    return pressed;
  }
}
