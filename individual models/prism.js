let prism;
let prisms = []; // needs to be developed

let beams = [];

//customizable parameters
let rainbow = true;

let rotate_amount;

const rarerToDenser = 1.5; // refractive index
const denserToRarer = 0.67; // refractive index

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360);
  //blendMode(LIGHTEST);
  prism = new Prism(mouseX, mouseY, (height * 1) / 10);
  for (let i = 0; i < 6; i++) {
    beams.push(new Beam(0, random(height), random(2 * PI), 30));
    beams.push(new Beam(width, random(height), random(2 * PI), 30));
    beams.push(new Beam(random(width), 0, random(2 * PI), 30));
    beams.push(new Beam(random(width), height, random(2 * PI), 30));
  }
}

function draw() {
  background(0, 100);
  // background(0)
  
  prism.show();
  prism.update();
  for (let beam of beams) {
    beam.show();
    beam.touch(prism);
  }

  // beam.show();
  // beam.touch(prism);
  // beam2.show();
  // beam2.touch(prism);

  //console.log(keyCode);
}

function keyPressed() {
  if (key == "r" || key == "R") {
    rainbow = !rainbow;
  }
}

class Surface {
  constructor(a,b,p3) {
    this.a = a; // vector
    this.b = b;
    this.p3 = p3;
    this.mid = createVector((a.x+b.x)/2,(a.y+b.y)/2);
    this.inner_normal_dir = createVector((p3.x-this.mid.x),(p3.y-this.mid.y)); //mid->p3
    //console.log(b.x);
    //console.log(this.inner_normal_dir);
    this.theta = atan(this.inner_normal_dir.y/this.inner_normal_dir.x);
    //!!!!
    this.theta = abs(this.theta);
    
    if (this.inner_normal_dir.x >= 0 && this.inner_normal_dir.y < 0) {
      this.inner_normal_angle = 2*PI - this.theta;
      this.outer_normal_angle = this.inner_normal_angle - PI;
    } else if (this.inner_normal_dir.x < 0 && this.inner_normal_dir.y <= 0) {
      this.inner_normal_angle = PI + this.theta;
      this.outer_normal_angle = this.inner_normal_angle - PI;
    } else if (this.inner_normal_dir.x <= 0 && this.inner_normal_dir.y > 0) {
      this.inner_normal_angle = PI - this.theta;
      this.outer_normal_angle = this.inner_normal_angle + PI;
    } else if (this.inner_normal_dir.x > 0 && this.inner_normal_dir.y >= 0) {
      this.inner_normal_angle = this.theta;
      this.outer_normal_angle = this.inner_normal_angle + PI;
    } 
    
  }
}

class Prism {
  constructor(px,py,height) {
    this.pos = createVector(px,py); // center of the prism
    this.height = height;
    // vertex v1: left bottom v2: right bottom v3: top
    this.v1 = createVector(this.height*(-sqrt(3)/3),
                           this.height*1/3);
    this.v2 = createVector(this.height*(sqrt(3)/3),
                           this.height*1/3);
    this.v3 = createVector(0,
                           this.height*(-2/3));
    this.angle = 0;
  }

  show() {
    push();
    translate(this.pos.x,this.pos.y);
    // rotate(this.angle);
    stroke(360);
    circle(0,0,1);
    // draw three surfaces
    line(this.v1.x,this.v1.y,this.v2.x,this.v2.y);
    line(this.v2.x,this.v2.y,this.v3.x,this.v3.y);
    line(this.v1.x,this.v1.y,this.v3.x,this.v3.y);
    beginShape();
    fill(255,100);
    noStroke();
    vertex(this.v1.x,this.v1.y);
    vertex(this.v2.x,this.v2.y);
    vertex(this.v3.x,this.v3.y);
    endShape();
    pop();
  }
  
  update() {
    this.rotate();
    this.pos.x = mouseX;
    this.pos.y = mouseY;
  }
  
  rotate() {
    if (keyIsPressed || mouseIsPressed) {
      let rotate_amount;
      if  (keyCode == RIGHT_ARROW || mouseIsPressed) {
        this.angle += PI/180;
        rotate_amount = PI/180;
      } else if(keyCode == LEFT_ARROW) {
        this.angle -= PI/180;
        rotate_amount = -PI/180;
      } else {
        this.angle += 0;
        rotate_amount = 0;
      }
      this.v1.x = this.v1.x*cos(rotate_amount) - this.v1.y*sin(rotate_amount);
      this.v1.y = this.v1.x*sin(rotate_amount) + this.v1.y*cos(rotate_amount);
      this.v2.x = this.v2.x*cos(rotate_amount) - this.v2.y*sin(rotate_amount);
      this.v2.y = this.v2.x*sin(rotate_amount) + this.v2.y*cos(rotate_amount);
      this.v3.x = this.v3.x*cos(rotate_amount) - this.v3.y*sin(rotate_amount);
      this.v3.y = this.v3.x*sin(rotate_amount) + this.v3.y*cos(rotate_amount);
    }
    if (this.angle > 2*PI) { 
      this.angle = this.angle % (2*PI);
      // this.angle always in (0,2PI)
    }
  }
}

class Beam {
  constructor(startx, starty, angle, length) {
    this.start = createVector(startx, starty);
    this.angle = angle;
    // if (cos(angle) >= 0) {
    //   this.angle = angle%(2*PI);
    // } else if (cos(angle) < 0) {
    //   this.angle = (angle-PI)%(2*PI);
    // }
    
    this.originAngle = angle;
    this.fluctuateFrq = random(0.005, 0.015);
    this.fluctuateAmp = random(0.03, 0.06);
    this.dir = p5.Vector.fromAngle(angle); //0->2PI
    this.length = length;
    this.incidence_angle = null;
    this.state = false;
    //console.log(this.angle,this.dir);
  }

  show() {
    let angle = this.originAngle + sin(frameCount * this.fluctuateFrq) * this.fluctuateAmp;
    this.dir = p5.Vector.fromAngle(angle); //0->2PI
    push();
    translate(this.start.x, this.start.y);
    if (this.state == false) {
      stroke(210);
      line(0, 0, this.dir.x * 4000, this.dir.y * 4000);
    }
    stroke(330);
    strokeWeight(2);
    line(0, 0, this.dir.x * this.length, this.dir.y * this.length);
    strokeWeight(1);
    pop();
  }

  touch(prism) {
    let surfaces = [];
    surfaces.push(new Surface(prism.v1, prism.v2, prism.v3));
    surfaces.push(new Surface(prism.v2, prism.v3, prism.v1));
    surfaces.push(new Surface(prism.v1, prism.v3, prism.v2));
    //console.log(surfaces[0].x.y);
    let closer = null; // pt
    let farther = null; // pt
    let closer_surface = null; // surface instance
    let record_closer = Infinity; // number
    let record_farther = 0; // number
    let closer_angle = null;
    let closer_surface_angle = null;
    let farther_surface = null; // record farther surface
    // new
    let inner_angle = null;
    let outer_angle = null;
    for (let surface of surfaces) {
      let returned = this.intersect(surface);
      if (returned) {
        let pt = returned[0];
        let surface = returned[1];
        const d = p5.Vector.dist(this.start, pt);
        if (d < record_closer) {
          record_closer = d;
          closer = pt;
          closer_surface = surface;
        }
        if (d > record_farther) {
          record_farther = d;
          farther_surface = surface;
        }
      }
    }
    if (closer) {
      this.state = true;
      stroke(250);
      line(this.start.x, this.start.y, closer.x, closer.y);
      circle(closer.x, closer.y, 3);

      let normal_1in = closer_surface.inner_normal_angle;
      let normal_1out = closer_surface.outer_normal_angle;
      let incidence_angle = normal_1in - this.angle;
      if (incidence_angle > PI / 2) {
        incidence_angle = -(2 * PI - incidence_angle);
      } else if (incidence_angle < -PI / 2) {
        incidence_angle = 2 * PI + incidence_angle;
      }
      // >0: ang_normal>ang_beam(clockwise larger)
      //console.log(incidence_angle*(180/PI));

      //this.drawNormal(closer.x,closer.y,normal_1in);
      this.drawReflection(closer.x, closer.y, normal_1out, this.angle);

      // console.log(closer_angle*(180/PI));

      let r1 = asin(sin(abs(incidence_angle)) / rarerToDenser); // must be positive
      //console.log(r1*(180/PI));
      //console.log('n',normal_1in*(180/PI));
      //console.log('r1',r1*(180/PI));
      if (incidence_angle >= 0) {
        inner_angle = (normal_1in - r1) % (2 * PI);
      } else if (incidence_angle < 0) {
        inner_angle = (normal_1in + r1) % (2 * PI);
      } // parentheses!!!
      //console.log('in',inner_angle*(180/PI));
      let inner_dir = p5.Vector.fromAngle(inner_angle);
      // line(closer.x,
      //      closer.y,
      //      closer.x+inner_dir.x*20,
      //      closer.y+inner_dir.y*20);
      let inner = new Beam(closer.x, closer.y, inner_angle, 1); //len dsnt matter
      //console.log("here");
      //console.log(farther_surface.p3.x);
      let returned = inner.intersect(farther_surface);
      if (returned) {
        let pt2 = returned[0];
        let farther_surface = returned[1];
        circle(pt2.x, pt2.y, 3);
        stroke(300);
        line(closer.x, closer.y, pt2.x, pt2.y);

        //console.log(farther_surface.b);
        let normal_2in = farther_surface.inner_normal_angle;
        let normal_2out = farther_surface.outer_normal_angle;

        //console.log('n',normal_2in*(180/PI));
        //this.drawNormal(pt2.x,pt2.y,normal_2in);

        let r2 = PI / 3 - r1; // must be positive
        let emergence_angle = asin(sin(r2) / denserToRarer); // must be positive
        let inner_incidence_angle = normal_2out - inner_angle;
        if (inner_incidence_angle > PI / 2) {
          inner_incidence_angle = -(2 * PI - inner_incidence_angle);
        } else if (inner_incidence_angle < -PI / 2) {
          inner_incidence_angle = 2 * PI + inner_incidence_angle;
        }

        if (inner_incidence_angle >= 0) {
          outer_angle = (normal_2out - emergence_angle) % (2 * PI);
        } else if (inner_incidence_angle < 0) {
          outer_angle = (normal_2out + emergence_angle) % (2 * PI);
        }

        let outer_dir = p5.Vector.fromAngle(outer_angle);
        push();
        translate(pt2.x, pt2.y);
        for (let i = 0; i < 10; i++) {
          push();
          if (rainbow == true) {
            let hue = map(i, 10, 0, 300, 0);
            stroke(hue, 360, 360);
          } else {
            stroke(360);
          }
          let spread = map(i, 0, 10, -PI / 60, PI / 60); //1 dgre
          rotate(spread);
          line(0, 0, outer_dir.x * 4000, outer_dir.y * 4000);
          pop();
        }
        pop();
      }
    } else {
      this.state = false;
    }
  }

  drawNormal(x, y, normal_angle) {
    let dir = p5.Vector.fromAngle(normal_angle);
    line(x, y, x + dir.x * 20, y + dir.y * 20);
    stroke(0, 360, 360);
    line(x, y, x - dir.x * 20, y - dir.y * 20);
    stroke(210);
  }

  drawReflection(x, y, normal, beam) {
    let ref_angle = normal - ((beam - PI) % (2 * PI)) + normal;
    let dir = p5.Vector.fromAngle(ref_angle);
    stroke(44, 40, 60);
    line(x, y, x + dir.x * 4000, y + dir.y * 4000);
    stroke(210);
  }

  intersect(surface) {
    // single surface

    // a,b are two endpoints of surface line
    // surface is a vector constructed in Beam.touch()
    const x1 = surface.a.x + mouseX;
    const y1 = surface.a.y + mouseY;
    const x2 = surface.b.x + mouseX;
    const y2 = surface.b.y + mouseY;

    // the start and end of the unit vector of beam
    const x3 = this.start.x;
    const y3 = this.start.y;
    const x4 = this.start.x + this.dir.x;
    const y4 = this.start.y + this.dir.y;

    // denominator
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (den == 0) {
      return; // wait for sth but return nothing
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

    // a line segment intersect with a vector
    if (t > 0 && t < 1 && u > 0) {
      const pt = createVector();
      pt.x = x1 + t * (x2 - x1);
      pt.y = y1 + t * (y2 - y1);
      //console.log('true', this.start.x);
      //circle(pt.x,pt.y,7);
      let surface_angle = atan((y1 - y2) / (x1 - x2));
      let arr = [pt, surface];
      //console.log(pt.x,surface_angle*(180/PI),frameCount);
      //the angle is right
      return arr;
      // All we have to return is this pt!
      // the previous calculation is one-off
    } else {
      return;
    }
  }
}
