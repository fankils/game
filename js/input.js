export class InputHandler {
  constructor() {
    this.keys = { left: false, right: false, jump: false };

    // Клавиатура
    window.addEventListener('keydown', (e) => this.handleKey(e, true));
    window.addEventListener('keyup', (e) => this.handleKey(e, false));

    // Экранные кнопки (Touch)
    this.bindTouch('btn-left', 'left');
    this.bindTouch('btn-right', 'right');
    this.bindTouch('btn-jump', 'jump');
  }

  handleKey(e, isDown) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyD'].includes(e.code)) {
      e.preventDefault();
    }
    switch (e.code) {
      case 'ArrowLeft': case 'KeyA': this.keys.left = isDown; break;
      case 'ArrowRight': case 'KeyD': this.keys.right = isDown; break;
      case 'Space': case 'ArrowUp': case 'KeyW': this.keys.jump = isDown; break;
    }
  }

  bindTouch(elementId, keyName) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    el.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys[keyName] = true; });
    el.addEventListener('touchend', (e) => { e.preventDefault(); this.keys[keyName] = false; });
    el.addEventListener('touchcancel', (e) => { e.preventDefault(); this.keys[keyName] = false; });
    // Для мыши (чтобы можно было тестировать на ПК в уменьшенном окне)
    el.addEventListener('mousedown', () => this.keys[keyName] = true);
    el.addEventListener('mouseup', () => this.keys[keyName] = false);
    el.addEventListener('mouseleave', () => this.keys[keyName] = false);
  }

  clearKeys() {
    this.keys.left = false;
    this.keys.right = false;
    this.keys.jump = false;
  }
}