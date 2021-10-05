class EnviromentTexture {
  constructor(imgUrl) {
    this.LoadFromImage(imgUrl);
  }

  LoadFromImage(imgUrl) {
    this.data = [];
  }

  Sample(direction) {
      return {r: direction.x * 255, g: direction.y * 255, b: direction.z * 255, a: 255}
  }
}
