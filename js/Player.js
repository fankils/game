import { checkCollision } from './collision.js';

export class Player {
  constructor(x, y) {
    this.startX = x;
    this.startY = y;
    this.width = 30;
    this.height = 40;
    this.reset();
  }

  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.vx = 0;
    this.vy = 0;
    this.speed = 300;
    this.jumpForce = -600;
    this.gravity = 1200;
    this.isGrounded = false;
  }

  update(dt, input, platforms) {
    this.vx = 0;
    if (input.keys.left) this.vx = -this.speed;
    if (input.keys.right) this.vx = this.speed;

    this.x += this.vx * dt;
    for (let platform of platforms) {
      if (checkCollision(this, platform)) {
        if (this.vx > 0) this.x = platform.x - this.width;
        else if (this.vx < 0) this.x = platform.x + platform.width;
      }
    }

    this.vy += this.gravity * dt;
    this.y += this.vy * dt;
    this.isGrounded = false; 

    for (let platform of platforms) {
      if (checkCollision(this, platform)) {
        if (this.vy > 0) {
          this.y = platform.y - this.height;
          this.vy = 0;
          this.isGrounded = true; 
        } else if (this.vy < 0) {
          this.y = platform.y + platform.height;
          this.vy = 0;
        }
      }
    }

    if (input.keys.jump && this.isGrounded) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
    }

    if (this.x < 0) this.x = 0;
    if (this.x + this.width > 800) this.x = 800 - this.width;
  }

  draw(ctx) {
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.x + 5, this.y + 10, 5, 5);
    ctx.fillRect(this.x + 20, this.y + 10, 5, 5);
  }
}