// Import required scripts
importScripts("Mathmatics.js", "Vector.js", "Triangle.js", "RayHitInfo.js", "EnviromentTexture.js");

// Settings contains all data the worker needs for rendering
settings = {
  // In realtime mode, pixel-skipping is enabled, which enhances performance, but introduces noise!
  useRealtimeMode: false,

  // List of triangles to be rendered (updated by RayTracer)
  triangles: [],

  // Camera settings (updated by RayTracer)
  camPos: null,
  cameraFovMult: 1,

  // Current enviroment
  enviromentTexture: null,

  // Area this worker has to render
  area: { x: 0, y: 0, w: 100, h: 100 },
  resolution: new Vector(100, 100, 0),
};

self.addEventListener("message", (e) => {
  if (e.data.type == "AssignArea") {
    console.log(`Setting area to: x: ${e.data.x}, y: ${e.data.y}, w: ${e.data.w}, h: ${e.data.h}. `);
    settings.area = e.data;
  } else if (e.data.type == "StartLoop") {
    // Start rendering loop. Random delay, so that the workers always complete their area at different
    // times and dont block each other when sending the pixels to the main script.
    setTimeout(StartRenderLoop, random(0, 50));
  } else if (e.data.type == "RenderOnce") {
    setTimeout(RenderFrame, random(0, 50));
  } else if (e.data.type == "SetTriangles") {
    SetTrianglesFromObjArray(e.data.triangles);
  } else if (e.data.type == "SetCamData") {
    settings.camPos = e.data.camPos;
    settings.cameraFovMult = e.data.cameraFovMult;
  } else if (e.data.type == "SetResolution") {
    settings.resolution = e.data.resolution;
  } else if (e.data.type == "SetEnviroment") {
    settings.enviromentTexture = new EnviromentTexture();
    settings.enviromentTexture.pixels = e.data.enviromentTexture.pixels;
    settings.enviromentTexture.width = e.data.enviromentTexture.width;
    settings.enviromentTexture.height = e.data.enviromentTexture.height;
  }
});

// Start a renderloop on this worker, repeating the RenderFrame function.
function StartRenderLoop() {
  setInterval(RenderFrame, 50);
}

// Since objects loose their type when send to a worker, restore the type of the triangles and store them in the triangles array.
function SetTrianglesFromObjArray(objArray) {
  settings.triangles = [];
  for (var i = 0; i < objArray.length; i += 1) {
    settings.triangles.push(new Triangle(objArray[i].p0, objArray[i].p1, objArray[i].p2, objArray[i].color));
  }
}

// Render the dedicated area once and send the result back to RayTracer.js to be drawn.
function RenderFrame() {
  var pixels = [];
  for (var x = settings.area.x; x < settings.area.x + settings.area.w; x += 1) {
    pixels[x] = [];
    for (var y = settings.area.y; y < settings.area.y + settings.area.h; y += 1) {
      pixels[x][y] = RenderPixel(x, y);
    }
  }

  // Once completed, send the pixels to the RayTracer, so they can be drawn on the screen
  this.postMessage(pixels);
}

// Returns the color of a given pixel
function RenderPixel(x, y) {
  if (settings.useRealtimeMode) {
    // Raytracer skips random pixels based on their distance from the center for better performance. (Adds noise!)
    var pixelDistanceFromCenterSqrt = Math.abs((x - resolution.x / 2) / resolution.x) + Math.abs((y - resolution.y / 2) / resolution.y);
    var chanceToSkipPixel = 99.5;
    if (random(0, 100) < chanceToSkipPixel * pixelDistanceFromCenterSqrt) {
      return {
        r: 0,
        g: 0,
        b: 0,
        a: 0,
      };
    }
  }

  // Calculate the screen coordinate in a range between 0 and 1
  var uv = new Vector(x / settings.resolution.x, y / settings.resolution.y);

  // Get the direciton vector for the current pixel on the screen
  var camDirection = GetRayDirection(uv.x, uv.y);

  // Cast a ray from the camera in the calculated direction and store the RayHitInfo
  var hit = CastRay(settings.camPos, camDirection);

  // If a triangle was hit, return the respective triangles color, otherwise return the sampled color from the current enviromentTexture
  if (hit != null) {
    return {
      r: hit.triangle.color.r,
      g: hit.triangle.color.g,
      b: hit.triangle.color.b,
      a: 255,
    };
  } else {
    return settings.enviromentTexture.Sample(camDirection);
  }
}

// Cast a ray from an origin in a given direction. If it hits the triangle, returns the hitPoint, otherwise returns null.
function CastRay(origin, direction) {
  // Normalize the direction
  direction = direction.normalized();

  var rayHitInfo = null;
  var currentHitDistance = 1000;

  // Loop through all triangles that need to be rendered
  for (var i = 0; i < settings.triangles.length; i += 1) {
    // Calculate the distance the ray traveled before hitting the plane the triangle is on
    var triangleNormal = settings.triangles[i].GetNormal();
    var D = Vector.Dot(triangleNormal, settings.triangles[i].p0);
    var distance = -((Vector.Dot(triangleNormal, origin) + D) / Vector.Dot(triangleNormal, direction));


    // Checks if the ray hits the triangle infront of the camera and not behind it
    if (distance > 0 && distance < currentHitDistance) {
      // Calculate the point where the ray intersects the triangle plane
      var hitPoint = Vector.Add(origin, Vector.Scale(direction, distance));
      // Check if the point on the plane we intersected is inside the tringle
      if(InsideOutsideTest(settings.triangles[i], hitPoint)) {
        rayHitInfo = new RayHitInfo(settings.triangles[i], hitPoint);
        currentHitDistance = distance;
      }
    }
  }

  // If no hit was found, return null
  return rayHitInfo;
}

// Returns a direction vector based on a normalized screenposition (0 -> 1). Forward is the direction the camera is facing
function GetRayDirection(screenX, screenY) {
  // Get point on grid infront of camera
  var direction = new Vector((screenX * 2 - 1) * settings.cameraFovMult, (screenY * 2 - 1) * settings.cameraFovMult, 1);
  return direction.normalized();
}

// Test if the given triangle contains the given point (which lies on the same plane as the triangle).
function InsideOutsideTest(triangle, point) {
  // Calculate edge vectors
  var edge0 = Vector.Sub(triangle.p1, triangle.p0);
  var edge1 = Vector.Sub(triangle.p2, triangle.p1);
  var edge2 = Vector.Sub(triangle.p0, triangle.p2);

  // Calculate vectors from the point to each corner of the triangle
  var C0 = Vector.Sub(point, triangle.p0);
  var C1 = Vector.Sub(point, triangle.p1);
  var C2 = Vector.Sub(point, triangle.p2);

  // Calculate the normal of the triangle
  var triangleNormal = triangle.GetNormal();

  // If the (cosecant) angle between all sides and the respective point (C0, C1, C2) is positive, the point is within the triangle.
  if (Vector.Dot(triangleNormal, Vector.Cross(edge0, C0)) > 0 && Vector.Dot(triangleNormal, Vector.Cross(edge1, C1)) > 0 && Vector.Dot(triangleNormal, Vector.Cross(edge2, C2)) > 0) {
    return true;
  } else {
    return false;
  }
}
