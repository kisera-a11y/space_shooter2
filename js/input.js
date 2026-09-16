// Tracks input state so game logic never touches raw DOM events.
// Exposes intent methods (isLeft/isRight/isFiring) rather than key codes,
// so a future touch/mouse input source can satisfy the same interface.
export class InputHandler {
  constructor() {
    this.keys = new Set();
    this.firePressed = false; // edge-triggered, for start/restart prompts

    this.touchLeft = false;
    this.touchRight = false;
    this.touchFiring = false;

    window.addEventListener('keydown', (e) => this._onKeyDown(e));
    window.addEventListener('keyup', (e) => this._onKeyUp(e));

    this._bindTouchControls();
  }

  // Wires up the on-screen buttons (see index.html/#touch-controls) using
  // Pointer Events, so touch and mouse both work and holding a button
  // behaves like holding a key. No-ops if the buttons aren't in the DOM.
  _bindTouchControls() {
    const leftBtn = document.getElementById('btn-left');
    const rightBtn = document.getElementById('btn-right');
    const fireBtn = document.getElementById('btn-fire');
    if (!leftBtn || !rightBtn || !fireBtn) return;

    this._bindHoldButton(leftBtn, (down) => {
      this.touchLeft = down;
    });
    this._bindHoldButton(rightBtn, (down) => {
      this.touchRight = down;
    });
    this._bindHoldButton(fireBtn, (down) => {
      this.touchFiring = down;
      if (down) this.firePressed = true;
    });
  }

  _bindHoldButton(el, setPressed) {
    const press = (e) => {
      e.preventDefault();
      setPressed(true);
    };
    const release = (e) => {
      e.preventDefault();
      setPressed(false);
    };
    el.addEventListener('pointerdown', press);
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    el.addEventListener('pointerleave', release);
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
    return this.keys.has('ArrowLeft') || this.keys.has('KeyA') || this.touchLeft;
  }

  isRight() {
    return this.keys.has('ArrowRight') || this.keys.has('KeyD') || this.touchRight;
  }

  isFiring() {
    return this.keys.has('Space') || this.touchFiring;
  }

  // Returns true once per keypress, then resets. Used for menu confirm.
  consumeFirePressed() {
    const pressed = this.firePressed;
    this.firePressed = false;
    return pressed;
  }
}
