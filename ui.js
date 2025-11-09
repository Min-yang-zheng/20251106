class UI {
  constructor() {
    this.buttons = [];
    this.hoveredButton = null;
    this.selectedEffect = null;
    this.cursorTrail = [];
  }

  createButtons() {
    this.buttons = [];
    const options = ['a', 'b', 'c', 'd'];
    for (let i = 0; i < 4; i++) {
      this.buttons.push({
        x: 100,
        y: 200 + i * 60,
        w: 600,
        h: 50,
        label: options[i]
      });
    }
  }

  render() {
    this.renderCursorEffect();

    if (quiz.isFinished) {
      this.renderResult();
    } else {
      if (this.buttons.length === 0) {
        this.createButtons();
      }
      this.renderQuestion();
      this.renderButtons();
      this.renderSelectionEffect();
    }
  }

  renderQuestion() {
    const q = quiz.getCurrentQuestion();
    fill(2, 48, 71); // 改為深藍色 #023047
    textSize(28);
    textAlign(LEFT, TOP);
    text(`Q${quiz.currentIndex + 1}: ${q.question}`, 100, 100);
  }

  renderButtons() {
    const q = quiz.getCurrentQuestion();
    this.buttons.forEach(btn => {
      push();
      if (this.hoveredButton === btn) {
        stroke(255);
        strokeWeight(3);
        fill(132, 180, 225);
      } else {
        noStroke();
        fill(102, 150, 195);
      }
      rect(btn.x, btn.y, btn.w, btn.h, 10);

      fill(2, 48, 71); // 改為深藍色 #023047
      noStroke();
      textSize(18);
      textAlign(LEFT, CENTER);
      text(`${btn.label.toUpperCase()}. ${q[btn.label]}`, btn.x + 20, btn.y + btn.h / 2);
      pop();
    });
  }

  renderResult() {
    const score = quiz.score;
    const total = quiz.questions.length;
    const percentage = score / total;

    // 根據分數百分比顯示不同的煙火動畫
    if (percentage >= 0.9) {
      this.renderFireworksAnimation(5); // 最好的動畫
    } else if (percentage >= 0.7) {
      this.renderFireworksAnimation(4);
    } else if (percentage >= 0.5) {
      this.renderFireworksAnimation(3);
    } else if (percentage >= 0.3) {
      this.renderFireworksAnimation(2);
    } else {
      this.renderFireworksAnimation(1); // 最基本的動畫
    }

    fill(2, 48, 71); // 改為深藍色 #023047
    textSize(48);
    textAlign(CENTER, CENTER);
    text(`你的分數: ${score} / ${total}`, width / 2, height / 2 - 50);

    // Reset button
    const resetButton = { x: width / 2 - 100, y: height / 2 + 50, w: 200, h: 50 };
    push();
    if (this.isMouseOver(resetButton)) {
      fill(3, 128, 158);
    } else {
      fill(33, 158, 188); // 219ebc
    }
    rect(resetButton.x, resetButton.y, resetButton.w, resetButton.h, 10);
    fill(255);
    textSize(24);
    text('重新開始', width / 2, resetButton.y + 25);
    pop();
    this.buttons = [{...resetButton, label: 'reset'}];
  }

  renderFireworksAnimation(level) {
    // 更新並顯示現有的粒子
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].show();
      if (particles[i].finished()) {
        particles.splice(i, 1);
      }
    }

    // 根據等級產生新的粒子
    const spawnRate = [60, 30, 15, 10, 5];
    const particlesPerSpawn = [1, 2, 3, 4, 5];

    if (frameCount % spawnRate[level - 1] === 0) {
      const x = random(width); // 煙火出現的位置擴展到整個畫布寬度
      const y = random(height); // 煙火出現的位置擴展到整個畫布高度
      const numParticles = particlesPerSpawn[level - 1] * 10;
      const baseHue = random(20, 45); // 限制在 d4a373 附近的色相範圍

      for (let i = 0; i < numParticles; i++) { // 增加粒子數量，使煙火更密集
        let pColor;
        push();
        colorMode(HSB, 360, 100, 100, 1);
        if (level <= 2) {
          // 低等級使用單一暖色系
          pColor = color(baseHue, random(50, 100), 100, 0.8);
        } else {
          // 高等級使用更多彩的暖色
          pColor = color(random(baseHue - 30, baseHue + 30), random(50, 100), 100, 0.8);
        }
        pop();
        
        const speed = random(1, level * 1.5);
        particles.push(new Particle(x, y, pColor, speed));
      }
    }
  }

  renderCursorEffect() {
    this.cursorTrail.push(createVector(mouseX, mouseY));
    if (this.cursorTrail.length > 20) {
      this.cursorTrail.shift();
    }

    for (let i = 0; i < this.cursorTrail.length; i++) {
      let p = this.cursorTrail[i];
      let size = map(i, 0, this.cursorTrail.length, 1, 10);
      let alpha = map(i, 0, this.cursorTrail.length, 0, 150);
      fill(255, 255, 255, alpha);
      noStroke();
      ellipse(p.x, p.y, size, size);
    }
  }

  renderSelectionEffect() {
    if (this.selectedEffect) {
      this.selectedEffect.alpha -= 5;
      if (this.selectedEffect.alpha < 0) {
        this.selectedEffect = null;
      } else {
        push();
        noFill();
        stroke(255, 255, 255, this.selectedEffect.alpha);
        strokeWeight(4);
        rect(this.selectedEffect.x, this.selectedEffect.y, this.selectedEffect.w, this.selectedEffect.h, 10);
        pop();
      }
    }
  }

  onMouseMove(mx, my) {
    this.hoveredButton = null;
    for (const btn of this.buttons) {
      if (this.isMouseOver(btn)) {
        this.hoveredButton = btn;
        break;
      }
    }
  }

  onMousePressed(mx, my) {
    for (const btn of this.buttons) {
      if (this.isMouseOver(btn)) {
        if (quiz.isFinished) {
          if (btn.label === 'reset') {
            quiz.reset();
            this.buttons = [];
            particles = [];
            seaCreatures = [];
          }
        } else {
          quiz.answer(btn.label);
          this.selectedEffect = { ...btn, alpha: 255 };
          this.addSeaCreature();
        }
        break;
      }
    }
  }

  addSeaCreature() {
    const x = random(width);
    const y = random(height);
    const type = random(['fish', 'jellyfish']);
    seaCreatures.push(new SeaCreature(x, y, type));
  }

  renderSeaCreatures() {
    seaCreatures.forEach(creature => {
      creature.update();
      creature.display();
    });
  }

  isMouseOver(btn) {
    return mouseX > btn.x && mouseX < btn.x + btn.w &&
           mouseY > btn.y && mouseY < btn.y + btn.h;
  }
}

class Particle {
  constructor(x, y, col, speed = random(1, 5)) {
    this.x = x;
    this.y = y;
    const angle = random(TWO_PI);
    this.vx = cos(angle) * speed;
    this.vy = sin(angle) * speed;
    this.alpha = 255;
    this.color = col;
    this.vy += 0.05; // Gravity
  }

  finished() {
    return this.alpha < 0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 5;
  }

  show() {
    noStroke();
    fill(red(this.color), green(this.color), blue(this.color), this.alpha);
    ellipse(this.x, this.y, 16);
  }
}

class SeaCreature {
  constructor(x, y, type) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.5, 1.5));
    this.type = type;
    this.size = random(20, 50);
    this.color = color(random(100, 255), random(100, 255), random(100, 255), 180);
    this.angle = this.vel.heading();
  }

  update() {
    this.pos.add(this.vel);
    this.angle = lerp(this.angle, this.vel.heading(), 0.1);

    if (this.pos.x > width + this.size) this.pos.x = -this.size;
    if (this.pos.x < -this.size) this.pos.x = width + this.size;
    if (this.pos.y > height + this.size) this.pos.y = -this.size;
    if (this.pos.y < -this.size) this.pos.y = height + this.size;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    if (this.type === 'fish') {
      this.drawFish();
    } else if (this.type === 'jellyfish') {
      this.drawJellyfish();
    }
    pop();
  }

  drawFish() {
    fill(this.color);
    noStroke();
    // Body
    ellipse(0, 0, this.size, this.size * 0.6);
    // Tail
    triangle(-this.size * 0.5, 0, -this.size * 0.8, -this.size * 0.3, -this.size * 0.8, this.size * 0.3);
    // Eye
    fill(255);
    ellipse(this.size * 0.3, 0, this.size * 0.15);
  }

  drawJellyfish() {
    noStroke();
    // Head
    fill(this.color);
    arc(0, 0, this.size, this.size, PI, TWO_PI);
    // Tentacles
    for (let i = 0; i < 5; i++) {
      let x = -this.size / 2 + (i * this.size / 4);
      let len = this.size * random(0.8, 1.5);
      let sway = sin(frameCount * 0.1 + i * 0.5) * 5;
      stroke(this.color);
      strokeWeight(2);
      noFill();
      curve(x + sway, 0, x, 0, x, len, x + sway, len);
    }
  }
}