export class Platform {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw(ctx) {
    // Рисуем платформы (фиолетовый кирпич)
    ctx.fillStyle = '#8e44ad';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    // Добавим немного объема
    ctx.fillStyle = '#9b59b6';
    ctx.fillRect(this.x, this.y, this.width, 5);
  }
}