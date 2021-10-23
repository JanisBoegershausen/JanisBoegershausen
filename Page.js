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
  // 
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
    this.seedA = random();
    this.seedB = random();
    this.indexOfConnected = indexOfConnected;
    this.lineProgress = 0.5;
  }

  Draw() {
    // Add random change to velocity and limit velocity to a magnitude of 1
    this.velocity = Vector.Add(this.velocity, Vector.Scale(new Vector(RandomInRange(-1, 1), RandomInRange(-1, 1)), 0.15));
    this.velocity = Vector.Clamp(this.velocity, mouseIsPressed ? 3 : 1);

    // Move by velocity and wrap around screen
    this.position = Vector.Wrap(Vector.Add(this.position, this.velocity), new Vector(0, 0), new Vector(width, height));

    // Get distance between this and the connected particle
    var distanceToConnected = Vector.Distance(this.position, particles[this.indexOfConnected].position);
    // Get distance to mouse
    var distanceToMouse = Vector.Distance(this.position, new Vector(mouseX, mouseY));

    // If within range and the other particle is not connected to this
    if (distanceToConnected < 200 && distanceToConnected > 5 && particles[particles[this.indexOfConnected].indexOfConnected] != this) {
      // Increase line progress over time
      this.lineProgress = Math.min(this.lineProgress + (deltaTime / 1000 * 5), 1);
      // Calcuate the direction of the connection
      var direction = Vector.Sub(particles[this.indexOfConnected].position, this.position).normalized();
      // Add pull/push force based on distance
      this.velocity = Vector.Add(this.velocity, Vector.Scale(direction, Remap(distanceToConnected, 5, 200, -0.25, 0.05)));
      // Draw line of connection
      stroke(150);
      line(this.position.x, this.position.y, this.position.x + direction.x * this.lineProgress * distanceToConnected, this.position.y + direction.y * this.lineProgress * distanceToConnected);
    } else {
      // Find a new particle at random
      this.indexOfConnected = Math.floor(RandomInRange(0, particles.length));
      this.lineProgress = 0;
    }

    if(distanceToMouse < (mouseIsPressed ? 500 : 100)) {
      this.velocity = Vector.Add(this.velocity, Vector.Sub(this.position, new Vector(mouseX, mouseY)));
    }

    // Draw particle as circle
    noStroke();
    fill(Clamp(Remap(Math.pow(distanceToMouse, 1.5), 0, width, 255, 0), 100, 255));
    circle(this.position.x, this.position.y, 5, 5);
  }
}
