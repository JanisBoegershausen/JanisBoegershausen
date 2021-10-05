// Resolution of the raytracer.
var resolution = { x: 500, y: 500 };

// List of all triangles that are rendered
var triangles = [];

// Camera settings and data
var camPos;
var cameraFovMult = 0.5;

// Worker settings and data
var renderWorkers = [];
var horizontalTileCount = 4;
var verticalTileCount = 4;

function setup() {
  InitializeNewCanvas();

  camPos = new Vector(0, 0, 0);

  triangles.push(
    new Triangle(
      new Vector(-1, -1, 3),
      new Vector(-1, 1, 3),
      new Vector(1, -1, 3),
      { r: 200, g: 0, b: 0 }
    )
  );

  triangles.push(
    new Triangle(
      new Vector(-1, 1, 3),
      new Vector(1, 1, 3),
      new Vector(1, -1, 3),
      { r: 0, g: 0, b: 200 }
    )
  );

  // Create one worker for each tile
  var tileWidth = Math.floor(resolution.x / verticalTileCount);
  var tileHeight = Math.floor(resolution.y / horizontalTileCount);
  for (var x = 0; x < horizontalTileCount; x += 1) {
    for (var y = 0; y < horizontalTileCount; y += 1) {
      CreateWorker(
        Math.floor(x * tileWidth),
        Math.floor(y * tileHeight),
        tileWidth,
        tileHeight
      );
    }
  }

  // Start all workers (starts a single render, not the render loop)
  for (var i = 0; i < renderWorkers.length; i += 1) {
    renderWorkers[i].postMessage({
      type: "RenderOnce",
    });
  }
}

function draw() {
  // Todo: Show info about the renderer using html elements
}

// Create a worker which is dedicated to rendering the given rectangle.
function CreateWorker(x, y, w, h) {
  var worker = new Worker("RenderWorker.js");
  renderWorkers.push(worker);

  worker.onmessage = OnRenderWorkerDone;

  worker.postMessage({
    type: "SetResolution",
    resolution: resolution,
  });

  // Assign an area to the worker
  worker.postMessage({
    type: "AssignArea",
    x: x,
    y: y,
    w: w,
    h: h,
  });

  worker.postMessage({
    type: "SetTriangles",
    triangles: triangles,
  });

  worker.postMessage({
    type: "SetCamData",
    camPos: camPos,
    cameraFovMult: cameraFovMult,
  });
}

function UpdateCameraDataForAllWorkers() {
  for (var i = 0; i < renderWorkers.length; i += 1) {
    renderWorkers[i].postMessage({
      type: "SetCamPos",
      camPos: camPos,
    });
  }
}

// Called by a renderworker. Pixels is a 2d array of colors (rgba) of the entire screen (resolution.x * resolution.y).
// Only the pixels this worker is tasked to render are set.
function OnRenderWorkerDone(pixels) {
  for (var x = 0; x < resolution.x; x += 1) {
    for (var y = 0; y < resolution.x; y += 1) {
      if (pixels.data[x] != null && pixels.data[x][y] != null) {
        var color = pixels.data[x][y];
        DrawPixel(x, y, color.r, color.g, color.b, color.a);
      }
    }
  }
}

// Draw a pixel given a point in scaled coordinates. (If resolutionWidth == 10, x = 9 would be at the far right end of the screen)
function DrawPixel(x, y, r, g, b, a) {
  fill(r, g, b, a);
  strokeWeight(0);

  posX = (x / resolution.x) * width;
  posY = (y / resolution.y) * height;

  rect(posX, posY, width / resolution.x, width / resolution.y);
}

// Canvas helper functions:

function InitializeNewCanvas() {
  var sketchHolder = document.getElementById("rayTracer-canvas");
  var canvas = createCanvas(
    sketchHolder.offsetWidth,
    sketchHolder.offsetHeight
  );
  canvas.parent("rayTracer-canvas");
}

function windowResized() {
  ResizeCanvasToFit();
}

function ResizeCanvasToFit() {
  var sketchHolder = document.getElementById("rayTracer-canvas");
  if (
    sketchHolder.offsetWidth != width ||
    sketchHolder.offsetHeight != height
  ) {
    resizeCanvas(sketchHolder.offsetWidth, sketchHolder.offsetHeight);
  }
}
