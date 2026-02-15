let slab;
let beams = [];
let E_RAY_OFFSET;



function setup() {
  const container = document.getElementById("p5-container");
  const canvas = createCanvas(
      container.offsetWidth,
      container.offsetHeight
    );
  canvas.parent("p5-container");

  colorMode(HSB, 360);

  E_RAY_OFFSET = radians(-16); 

  slab = new Slab(mouseX, mouseY, 50);

  for (let i = 0; i < 2; i++) {
    beams.push(new Beam(width, random(height), random(PI / 2, PI)));
  }
}

function draw() {
  background(0, 40);
  isInteracting = false;

  slab.update();
  slab.show();
 

  for (let beam of beams) {
    beam.show();
    beam.touch(slab);
  }
  
}

// ---------------- SLAB ----------------

class Slab {
  constructor(x, y, size) {
    this.pos = createVector(x, y);
    this.size = size;
    this.angle = 0;
  }

  update() {
    this.pos.x = mouseX;
    this.pos.y = mouseY;

    if (mouseIsPressed) {
      this.angle += 0.01;
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    rectMode(CENTER);
    noStroke();
    fill(200, 30, 90, 0.2);
    rect(0, 0, this.size, this.size);
    stroke(200, 20, 360);
    noFill();
    rect(0, 0, this.size, this.size);
    pop();
  }

  getEdges() {
    let h = this.size / 2;
    let pts = [
      createVector(-h, -h),
      createVector(h, -h),
      createVector(h, h),
      createVector(-h, h)
    ];

    for (let p of pts) {
      p.rotate(this.angle).add(this.pos);
    }

    return [
      [pts[0], pts[1]],
      [pts[1], pts[2]],
      [pts[2], pts[3]],
      [pts[3], pts[0]]
    ];
  }
}


class Beam {
  constructor(x, y, angle) {
    this.start = createVector(x, y);
    this.originAngle = angle;
    this.dir = p5.Vector.fromAngle(angle);
  }

  show() {
    stroke(60, 360, 360);
    line(
      this.start.x,
      this.start.y,
      this.start.x + this.dir.x * 4000,
      this.start.y + this.dir.y * 4000
    );
  }

  touch(slab) {
    let edges = slab.getEdges();
    let entry = null;
    let exit = null;

    for (let edge of edges) {
      let hit = this.intersect(edge[0], edge[1]);
      if (hit) {
        if (!entry) entry = hit;
        else exit = hit;
      }
    }

    if (!entry || !exit) return;
    isInteracting = true;


    // incoming beam
    stroke(60, 360, 360);
    line(this.start.x, this.start.y, entry.x, entry.y);
    circle(entry.x, entry.y, 4);

    let oDir = this.dir.copy();
    let eDir = this.dir.copy().rotate(E_RAY_OFFSET);

    // inside slab
    stroke(120, 360, 360);
    line(entry.x, entry.y, exit.x, exit.y);

    stroke(300, 360, 360);
    line(
      entry.x,
      entry.y,
      entry.x + eDir.x * dist(entry.x, entry.y, exit.x, exit.y),
      entry.y + eDir.y * dist(entry.x, entry.y, exit.x, exit.y)
    );

    // exit rays (parallel)
    stroke(120, 360, 360);
    line(
      exit.x,
      exit.y,
      exit.x + oDir.x * 4000,
      exit.y + oDir.y * 4000
    );

    stroke(300, 360, 360);
    line(
      exit.x + 12,
      exit.y + 12,
      exit.x + 12 + oDir.x * 4000,
      exit.y + 12 + oDir.y * 4000
    );
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
