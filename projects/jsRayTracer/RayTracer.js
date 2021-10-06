// Resolution of the raytracer.
var resolution = { x: 500, y: 500 };

// List of all triangles that are rendered
var triangles = [];

// Camera settings and data
var camPos = null;
var cameraFovMult = 1;

// Worker settings and data
var renderWorkers = [];
var horizontalTileCount = 4;
var verticalTileCount = 4;

var enviromentTexture;

function setup() {
  // Create a new canvas which is used by the raytracer
  InitializeNewCanvas();

  // Create and load an EnvriomentTexture using the texture at the bottom of the page
  enviromentTexture = new EnviromentTexture();
  enviromentTexture.LoadFromImage();

  // Set the camera position to the center of the world
  camPos = new Vector(0, 0, 0);

  // Create two triagnles which make up a red and blue square
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

  // Start rendering the scene once
  StartRenderFrame();
}

function draw() {
  // Todo: Show info about the renderer using html elements

  if (keyIsDown(13)) {
    background(0);
    StartRenderFrame();
  }
}

// Tell all workers to render their dedicated area once, send the result to be drawn and then wait for new messages.
function StartRenderFrame() {
  for (var i = 0; i < renderWorkers.length; i += 1) {
    renderWorkers[i].postMessage({
      type: "RenderOnce",
    });
  }
}

// Create a worker which is dedicated to rendering the given rectangle.
function CreateWorker(x, y, w, h) {
  // Create a new worker from the RenderWorker.js script and add it to our list of workers
  var worker = new Worker("RenderWorker.js");
  renderWorkers.push(worker);

  // Assign the function which handles messages that are send from the worker to this script
  worker.onmessage = OnRenderWorkerDone;

  // Send resolution to the worker
  worker.postMessage({
    type: "SetResolution",
    resolution: resolution,
  });

  // Send the workers area to the worker
  worker.postMessage({
    type: "AssignArea",
    x: x,
    y: y,
    w: w,
    h: h,
  });

  // Send the enviromentTexture to the worker
  worker.postMessage({
    type: "SetEnviroment",
    enviromentTexture: enviromentTexture,
  });

  // Send the triangles to the worker
  worker.postMessage({
    type: "SetTriangles",
    triangles: triangles,
  });

  // Send the camera data to the worker
  worker.postMessage({
    type: "SetCamData",
    camPos: camPos,
    cameraFovMult: cameraFovMult,
  });
}

// Sends the current camera data (position) to all workers
function UpdateCameraDataForAllWorkers() {
  for (var i = 0; i < renderWorkers.length; i += 1) {
    renderWorkers[i].postMessage({
      type: "SetCamPos",
      camPos: camPos,
    });
  }
}

// Called by a renderworker. Pixels is a 2d array of colors (rgba) of the entire screen (resolution.x, resolution.y).
// Only the pixels the worker is tasked to render are set.
function OnRenderWorkerDone(pixels) {
  // Iterate through all pixels in the recieved array
  for (var x = 0; x < resolution.x; x += 1) {
    for (var y = 0; y < resolution.x; y += 1) {
      // Check if the pixel is set
      if (pixels.data[x] != null && pixels.data[x][y] != null) {
        // Only if the pixel is set, draw it. Otherwise don't do anything
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
