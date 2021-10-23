var particles = [];

var gravity = new Vector(0, 0.1);

function setup() {
  // Create canvas and set its parent
  var c = createCanvas();
  var parent = document.getElementById("header-canvas-parent");
  c.parent(parent);

  // Create particles
  particles.push(new Particle());
}

function draw() {
  fitCanvasToParent();
  // Clear
  background(48, 50, 61)

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
  constructor() {
    this.position = new Vector(100, 100);
    this.velocity = new Vector(0, 2);
  }

  Draw() {
    this.velocity = Vector.Add(this.velocity, gravity)
    this.position = Vector.Add(this.position, this.velocity);
    fill(255);
    rect(this.position.x, this.position.y, 50, 50);
  }
}
