// Based on this article about raytracing: 
// https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-rendering-a-triangle/ray-triangle-intersection-geometric-solution

// Resolution of the raytracer.
var resolution = {x: 40, y: 40};
// List of all triangles that are rendered
var triangles = []

// Camera data
var camPos;
var cameraFovMult = 1;


function setup() {
    InitializeNewCanvas();

    camPos = createVector(0, 0, 0);

    triangles.push(
        new Triangle(
            createVector(-1, -1, 3), 
            createVector(-1,  1, 3),
            createVector( 1,  -1, 3))
        );

    frameRate(20);
}

function InitializeNewCanvas() {
    var sketchHolder = document.getElementById('rayTracer-canvas')
    var canvas = createCanvas(sketchHolder.offsetWidth, sketchHolder.offsetHeight);
    canvas.parent('rayTracer-canvas');
}

function ResizeCanvasToFit() {
    var sketchHolder = document.getElementById('rayTracer-canvas')
    resizeCanvas(sketchHolder.offsetWidth, sketchHolder.offsetHeight);
}

function draw() {
    ResizeCanvasToFit();

    // Zoom
    cameraFovMult = 0.1 + max(0, (mouseY / height));

    // Clear
    background(20, 22, 25);

    // Raytrace
    for(var x = 0; x < resolution.x; x+=1) {
        for(var y = 0; y < resolution.y; y+=1) {
            var uv = {x: x  / resolution.x, y: y / resolution.y}

            var camDirection = GetRayDirection(uv.x, uv.y);
            camDirection.normalize();

            var hitPoint = CastRay(camPos, camDirection);

            if(hitPoint != null) {
                DrawPixel(x, y, hitPoint.mag() * 20, hitPoint.mag() * 20, hitPoint.mag() * 20)
            } else {
                
            }
        }
    }
}

// Returns a direction vector based on the normalized screenposition (0 -> 1). Forward is the direction the camera is facing
function GetRayDirection(screenX, screenY) {
    // Get point on grid infront of camera
    var p = createVector(((screenX * 2) - 1)*cameraFovMult, ((screenY * 2) - 1)*cameraFovMult, 1);
    p.normalize();

    return p5.Vector.sub(p, createVector(0, 0, 0));
}

// Cast a ray from an origin in a given direction. If it hits a triangle, returns the hitPoint, otherwise returns null.
function CastRay(origin, direction) {
    var triangle = triangles[0];
    direction.normalize();
    // Calculate the distance the ray traveled before hitting the triangle (if it hits)
    var triangleNormal = triangle.GetNormal();
    var D = p5.Vector.dot(triangleNormal, triangle.p0);
    var distance = -(p5.Vector.dot(triangleNormal, origin) + D) / p5.Vector.dot(triangleNormal, direction);
    
    // Calculate the hit point
    var hitPoint = p5.Vector.add(origin, p5.Vector.mult(direction, distance));

    if(InsideOutsideTest(triangle, hitPoint)) {
        return hitPoint;
    } else {
        return null;
    }
}

// Test if the given triangle contains the given point. 
function InsideOutsideTest(triangle, point) {
    var edge0 = p5.Vector.sub(triangle.p1, triangle.p0);
    var edge1 = p5.Vector.sub(triangle.p2, triangle.p1);
    var edge2 = p5.Vector.sub(triangle.p0, triangle.p2);

    var C0 = p5.Vector.sub(point, triangle.p0); 
    var C1 = p5.Vector.sub(point, triangle.p1); 
    var C2 = p5.Vector.sub(point, triangle.p2);

    var triangleNormal = triangle.GetNormal();

    if (p5.Vector.dot(triangleNormal, p5.Vector.cross(edge0, C0)) > 0 && 
        p5.Vector.dot(triangleNormal, p5.Vector.cross(edge1, C1)) > 0 && 
        p5.Vector.dot(triangleNormal, p5.Vector.cross(edge2, C2)) > 0) 
            return true; // The given point is inside the triangle 
    else
        return false;
}

// Draw a pixel given a point in scaled coordinates. (If resolutionWidth == 10, x = 9 would be at the far right end of the screen)
function DrawPixel(x, y, r, g, b) {
    fill(r, g, b);
    strokeWeight(0);
    noStroke();
    
    posX = (x / resolution.x) * width;
    posY = (y / resolution.y) * height;

    rect(posX, posY, width / resolution.x, width / resolution.y);
}

class Triangle {
    constructor(a, b, c) {
        this.p0 = a;
        this.p1 = b;
        this.p2 = c;
    }

    GetNormal() {
        var A = p5.Vector.sub(this.p1, this.p0);
        var B = p5.Vector.sub(this.p2, this.p0);
        var C = p5.Vector.cross(A, B);
        C.normalize();
        return C;
    }
}