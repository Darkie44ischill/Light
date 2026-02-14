let mirror;
let beams = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);

  mirror = new Mirror(mouseX, mouseY, 200, 20);

  for (let i = 0; i < 6; i++) {
    beams.push(new Beam(0, random(height), random(2 * PI), 30));
    beams.push(new Beam(width, random(height), random(2 * PI), 30));
    beams.push(new Beam(random(width), 0, random(2 * PI), 30));
    beams.push(new Beam(random(width), height, random(2 * PI), 30));
  }
}

function draw() {
  background(0);

  mirror.show();
  mirror.update();

  for (let beam of beams) {
    beam.update();   // 🔥 animate beam direction
    beam.show();
    beam.touch(mirror);
  }
}

// ------------------ MIRROR ------------------

class Mirror {
  constructor(x, y, w, h) {
    this.pos = createVector(x, y);
    this.w = w;
    this.h = h;
    this.angle = 0;
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    stroke(200, 40, 360);
    strokeWeight(3);
    fill(210, 20, 100, 0.4);
    rectMode(CENTER);
    rect(0, 0, this.w, this.h);
    pop();
  }

  update() {
    this.pos.x = mouseX;
    this.pos.y = mouseY;

    if (mouseIsPressed) {
      this.angle += 0.01;
    }
  }

  getSurface() {
    let p1 = createVector(-this.w / 2, 0);
    let p2 = createVector(this.w / 2, 0);

    p1.rotate(this.angle).add(this.pos);
    p2.rotate(this.angle).add(this.pos);

    let normal = p5.Vector.fromAngle(this.angle - PI / 2);
    return { a: p1, b: p2, normal: normal };
  }
}

// ------------------ BEAM ------------------

class Beam {
  constructor(startx, starty, angle, length) {
    this.start = createVector(startx, starty);
    this.originAngle = angle;
    this.angle = angle;
    this.length = length;

    this.fluctuateFrq = random(0.005, 0.015);
    this.fluctuateAmp = random(0.03, 0.06);

    this.dir = p5.Vector.fromAngle(angle);
  }

  update() {
    this.angle =
      this.originAngle +
      sin(frameCount * this.fluctuateFrq) * this.fluctuateAmp;

    this.dir = p5.Vector.fromAngle(this.angle);
  }

  show() {
    stroke(193, 58, 61);
    line(
      this.start.x,
      this.start.y,
      this.start.x + this.dir.x * 4000,
      this.start.y + this.dir.y * 4000
    );

    stroke(208, 100, 40);
    strokeWeight(5);
    line(
      this.start.x,
      this.start.y,
      this.start.x + this.dir.x * this.length,
      this.start.y + this.dir.y * this.length
    );
    strokeWeight(1);
  }

  touch(mirror) {
    let surface = mirror.getSurface();
    let pt = this.intersect(surface.a, surface.b);
    if (!pt) return;

    stroke(80, 46, 100);
    line(this.start.x, this.start.y, pt.x, pt.y);
    circle(pt.x, pt.y, 4);

    let incoming = this.dir.copy().normalize();
    let normal = surface.normal.copy().normalize();

    let reflected = p5.Vector.sub(
      incoming,
      p5.Vector.mult(normal, 2 * incoming.dot(normal))
    );

    stroke(80, 46, 100);
    line(pt.x, pt.y, pt.x + reflected.x * 4000, pt.y + reflected.y * 4000);
  }

  intersect(a, b) {
    const x1 = a.x;
    const y1 = a.y;
    const x2 = b.x;
    const y2 = b.y;

    const x3 = this.start.x;
    const y3 = this.start.y;
    const x4 = this.start.x + this.dir.x * 4000;
    const y4 = this.start.y + this.dir.y * 4000;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den === 0) return null;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

    if (t > 0 && t < 1 && u > 0) {
      return createVector(
        x1 + t * (x2 - x1),
        y1 + t * (y2 - y1)
      );
    }
    return null;
  }
}
