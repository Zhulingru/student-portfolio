let particles = [];

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('background-container');
  canvas.style('display', 'block'); // 確保畫布正確顯示
  background(10);
  noStroke();
  // 根據視窗大小調整粒子數量
  const particleCount = Math.floor((windowWidth * windowHeight) / 10000);
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 重新調整粒子數量
  const newParticleCount = Math.floor((windowWidth * windowHeight) / 10000);
  if (newParticleCount > particles.length) {
    for (let i = particles.length; i < newParticleCount; i++) {
      particles.push(new Particle());
    }
  } else if (newParticleCount < particles.length) {
    particles.splice(newParticleCount);
  }
}

function draw() {
  background(10, 30); // 有殘影感
  for (let p of particles) {
    p.move();
    p.display();
    p.connect(particles);
  }
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D().mult(random(0.3, 1.0)); // 降低速度
    this.r = random(2, 4); // 縮小粒子大小
  }

  move() {
    this.pos.add(this.vel);
    if (this.pos.x > width || this.pos.x < 0) this.vel.x *= -1;
    if (this.pos.y > height || this.pos.y < 0) this.vel.y *= -1;
  }

  display() {
    fill(255, 150); // 降低不透明度
    ellipse(this.pos.x, this.pos.y, this.r);
  }

  connect(others) {
    for (let other of others) {
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      if (d < 80) { // 縮短連線距離
        stroke(255, map(d, 0, 80, 100, 0)); // 降低線條不透明度
        line(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
        noStroke();
      }
    }
  }
}
