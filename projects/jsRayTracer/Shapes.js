function Square(a, b, c, d) {
  var triangles = [];

  triangles.push(new Triangle(a, b, d, { r: 255, g: 0, b: 0, a: 255 }));
  triangles.push(new Triangle(b, c, d, { r: 0, g: 255, b: 0, a: 255 }));

  return triangles;
}

function Cube(a, b, c, d, e, f, g, h) {
  var triangles = [];

  triangles = triangles.concat(Square(a, b, c, d)); // Front
  triangles = triangles.concat(Square(e, f, g, h)); // Back
  triangles = triangles.concat(Square(g, c, b, f)); // Right
  triangles = triangles.concat(Square(a, e, h, d)); // Left
  triangles = triangles.concat(Square(a, b, f, e)); // Up
  triangles = triangles.concat(Square(c, d, h, g)); // Down

  return triangles;
}
