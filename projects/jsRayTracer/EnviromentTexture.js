class EnviromentTexture {
  constructor() {
    this.pixels = [];
    this.width = 0;
    this.height = 0;
  }

  LoadFromImage() {
    this.pixels = [];

    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    var img = document.getElementById("hdri");

    // Set canvas dimensions
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw image onto the canvas
    context.drawImage(img, 0, 0);

    // Read pixels from the canvas
    var myData = context.getImageData(0, 0, img.naturalWidth, img.naturalHeight);

    // Set dimensions
    this.width = myData.width;
    this.height = myData.height;

    for (var x = 0; x < this.width; x += 1) {
      this.pixels[x] = [];
      for (var y = 0; y < this.height; y += 1) {
        var colorStartIndex = this.ImageDataArrayIndexFromTextureCoordinate(x, y);
        this.pixels[x][y] = {
          r: myData.data[colorStartIndex],
          g: myData.data[colorStartIndex + 1],
          b: myData.data[colorStartIndex + 2],
          a: myData.data[colorStartIndex + 3],
        };
      }
    }
  }

  // Get the index for the red pixel in an int array containing all RGBA values for all pixels from the given coordinates in a range from 0 to width/height
  ImageDataArrayIndexFromTextureCoordinate(x, y) {
    var i = Math.floor(x + this.width * y) * 4;

    return i;
  }

  Sample(direction) {
    // Calculate uvs on texture from direction

    // Calculate angle around the Y Axis
    var forward = new Vector(0, 0, 1);
    var angleAlongY = Math.acos((direction.x * forward.x + direction.z * forward.z) / (Math.sqrt(Math.pow(direction.x, 2) + Math.pow(direction.z, 2)) * Math.sqrt(Math.pow(forward.x, 2) + Math.pow(forward.z, 2))));

    // Convert from radians to degrees
    angleAlongY = angleAlongY * (180 / Math.PI);

    // Make angle go from 0 to 360 clockwise instead of from 0 to 180 in both directions
    if (direction.x < 0) {
      angleAlongY = angleAlongY * -1 + 360;
    }

    // Calculate uv in range from 0 to 1
    var uv = {
      x: angleAlongY / 360,
      y: (direction.y + 1) / 2, // This might cause distortion towards the horizon
    };

    // Calculate textureCoordinate in range from 0 to width/height
    var textureCoordinate = {
      x: Math.floor(uv.x * this.width),
      y: Math.floor(uv.y * this.height),
    };

    var pixel = this.pixels[textureCoordinate.x][textureCoordinate.y];

    return pixel;
  }
}
