import { Player } from './Player.js';
import { Platform } from './Platform.js';
import { InputHandler } from './input.js';
import { checkCollision } from './collision.js';

export class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.input = new InputHandler();

    this.player = new Player(150, 380);
    this.platforms = [
      new Platform(0, 560, 800, 40),    // Земля
      new Platform(100, 460, 200, 20),  // Платформа 1
      new Platform(400, 360, 150, 20),  // Платформа 2
      new Platform(650, 260, 100, 20),  // Платформа 3
      new Platform(350, 160, 150, 20),  // Платформа 4
    ];

    // Предметы (3 рыбки)
    this.items = [
      { x: 180, y: 410, width: 30, height: 30, collected: false, emoji: '🐟' },
      { x: 450, y: 310, width: 30, height: 30, collected: false, emoji: '🐟' },
      { x: 400, y: 110, width: 30, height: 30, collected: false, emoji: '🐟' },
    ];

    // Опасная зона (лава на полу)
    this.hazards = [
      { x: 300, y: 550, width: 200, height: 20, emoji: '🔥' }
    ];

    // Финиш (Кот)
    this.finish = { x: 700, y: 210, width: 40, height: 40, emoji: '🐱' };

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('catGameHighScore')) || 0;
    document.getElementById('high-score').textContent = this.highScore;

    this.state = 'start'; // 'start', 'playing', 'paused', 'win', 'lose'
    this.lastTime = 0;
    this.loopId = null;

    this.loop = this.loop.bind(this);
    this.initUI();
    
    // Пауза при уходе со вкладки
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') {
        this.pause();
      }
    });
  }

  initUI() {
    document.getElementById('btn-start').addEventListener('click', () => this.start());
    document.getElementById('btn-retry').addEventListener('click', () => this.start());
    document.getElementById('btn-play-again').addEventListener('click', () => this.start());
    document.getElementById('btn-restart').addEventListener('click', () => this.start());
    document.getElementById('btn-pause').addEventListener('click', () => this.togglePause());
    document.getElementById('btn-resume').addEventListener('click', () => this.togglePause());
  }

  start() {
    this.hideAllScreens();
    this.player.reset();
    this.items.forEach(item => item.collected = false);
    this.score = 0;
    document.getElementById('score').textContent = this.score;
    
    this.state = 'playing';
    this.input.clearKeys(); // Очищаем клавиши при старте
    this.lastTime = performance.now();
    
    // Запускаем цикл, только если он еще не запущен
    if (!this.loopId) {
      this.loopId = requestAnimationFrame(this.loop);
    }
  }

  togglePause() {
    if (this.state === 'playing') this.pause();
    else if (this.state === 'paused') this.resume();
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.input.clearKeys();
    document.getElementById('pause-screen').classList.remove('hidden');
  }

  resume() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    document.getElementById('pause-screen').classList.add('hidden');
    this.lastTime = performance.now(); // Сбрасываем время, чтобы не было рывка
  }

  loop(timestamp) {
    let dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    if (dt > 0.1) dt = 0.1;

    if (this.state === 'playing') {
      this.update(dt);
    }
    this.render();

    this.loopId = requestAnimationFrame(this.loop);
  }

  update(dt) {
    this.player.update(dt, this.input, this.platforms);

    // Проверка падения в пропасть
    if (this.player.y > 600) {
      this.gameOver(false);
      return;
    }

    // Проверка опасной зоны (Шипы/Лава)
    for (let hazard of this.hazards) {
      if (checkCollision(this.player, hazard)) {
        this.gameOver(false);
        return;
      }
    }

    // Сбор предметов
    for (let item of this.items) {
      if (!item.collected && checkCollision(this.player, item)) {
        item.collected = true;
        this.score += 1;
        document.getElementById('score').textContent = this.score;
      }
    }

    // Проверка финиша (нужно собрать 3 рыбки)
    if (checkCollision(this.player, this.finish)) {
      if (this.score >= 3) {
        this.gameOver(true);
      }
    }
  }

  gameOver(isWin) {
    this.state = isWin ? 'win' : 'lose';
    this.input.clearKeys();
    
    if (isWin) {
      document.getElementById('win-screen').classList.remove('hidden');
      // Сохраняем рекорд
      if (this.score > this.highScore) {
        this.highScore = this.score;
        document.getElementById('high-score').textContent = this.highScore;
        localStorage.setItem('catGameHighScore', this.highScore);
      }
    } else {
      document.getElementById('lose-screen').classList.remove('hidden');
    }
  }

  hideAllScreens() {
    document.querySelectorAll('.overlay').forEach(el => el.classList.add('hidden'));
  }

  render() {
    this.ctx.clearRect(0, 0, 800, 600);
    
    // Фон (небо)
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, 800, 600);

    // Отрисовка платформ
    this.platforms.forEach(p => p.draw(this.ctx));

    // Отрисовка опасной зоны (огонь)
    this.ctx.font = '30px Arial';
    this.ctx.textAlign = 'center';
    for (let hazard of this.hazards) {
      // Рисуем огоньки
      for(let i = 0; i < hazard.width; i += 30) {
         this.ctx.fillText(hazard.emoji, hazard.x + i + 15, hazard.y + 15);
      }
    }

    // Отрисовка предметов
    for (let item of this.items) {
      if (!item.collected) {
        this.ctx.font = '30px Arial';
        this.ctx.fillText(item.emoji, item.x + 15, item.y + 25);
      }
    }

    // Отрисовка финиша (Кот)
    this.ctx.font = '40px Arial';
    this.ctx.fillText(this.finish.emoji, this.finish.x + 20, this.finish.y + 30);

    // Отрисовка героя
    this.player.draw(this.ctx);
  }
}