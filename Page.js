var particles = [];
var time = 10;

var gravity = new Vector(0, 0.1);

function setup() {
  // Create canvas and set its parent
  var c = createCanvas(width, height);
  var parent = document.getElementById("header-canvas-parent");
  c.parent(parent);
  fitCanvasToParent();

  // Create particles
  var count = 30;
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(Math.random() * width, Math.random() * height, Math.floor(RandomInRange(0, count))));
  }
}

function draw() {
  time += deltaTime / 1000;

  fitCanvasToParent();
  // Clear
  background(48, 50, 61);

  // Update all particles
  particles.forEach((p) => {
    p.Draw();
  });
}

// Scale canvas to the new resolution when the window is resized
function fitCanvasToParent() {
  var parent = document.getElementById("header-canvas-parent");
  resizeCanvas(parent.offsetWidth, parent.offsetHeight);
}

class Particle {
  constructor(x, y, indexOfConnected) {
    this.position = new Vector(x, y);
    this.velocity = new Vector(0, 0);
    this.color = new Color(200, 200, 200);
    this.seedA = random();
    this.seedB = random();
    this.indexOfConnected = indexOfConnected;
    this.lineProgress = 0.5;
  }

  Draw() {
    this.velocity = Vector.Add(this.velocity, Vector.Scale(new Vector(RandomInRange(-1, 1), RandomInRange(-1, 1)), 0.15));
    this.velocity = this.velocity.normalized();
    this.position = Vector.Wrap(Vector.Add(this.position, this.velocity), new Vector(0, 0), new Vector(width, height));

    var d = Vector.Distance(this.position, particles[this.indexOfConnected].position);
    if (d < 200 && d > 5 && particles[particles[this.indexOfConnected].indexOfConnected] != this) {
      this.lineProgress = Math.min(this.lineProgress + (deltaTime / 1000 * 5), 1);
      var direction = Vector.Sub(particles[this.indexOfConnected].position, this.position).normalized();
      this.velocity = Vector.Add(this.velocity, Vector.Scale(direction, Remap(d, 5, 200, -0.25, 0.05)));
      stroke(150);
      line(this.position.x, this.position.y, this.position.x + direction.x * this.lineProgress * d, this.position.y + direction.y * this.lineProgress * d);
    } else {
      this.indexOfConnected = Math.floor(RandomInRange(0, particles.length));
      this.lineProgress = 0;
    }

    noStroke();
    fill(this.color.r, this.color.g, this.color.b);
    circle(this.position.x, this.position.y, 5, 5);
  }
}
