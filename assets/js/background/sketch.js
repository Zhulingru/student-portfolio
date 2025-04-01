let particles = [];

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('background-container');
  background(10);
  noStroke();
  for (let i = 0; i < 80; i++) {
    particles.push(new Particle());
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
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
    this.vel = p5.Vector.random2D().mult(random(0.5, 1.5));
    this.r = random(3, 6);
  }

  move() {
    this.pos.add(this.vel);
    if (this.pos.x > width || this.pos.x < 0) this.vel.x *= -1;
    if (this.pos.y > height || this.pos.y < 0) this.vel.y *= -1;
  }

  display() {
    fill(255, 180);
    ellipse(this.pos.x, this.pos.y, this.r);
  }

  connect(others) {
    for (let other of others) {
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      if (d < 100) {
        stroke(255, map(d, 0, 100, 255, 0));
        line(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
        noStroke();
      }
    }
  }
}
