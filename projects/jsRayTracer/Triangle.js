class Triangle {
  constructor(a, b, c, color) {
    this.p0 = a;
    this.p1 = b;
    this.p2 = c;

    this.color = color;
  }

  GetNormal() {
    var A = Vector.Sub(this.p1, this.p0);
    var B = Vector.Sub(this.p2, this.p0);
    var C = Vector.Cross(A, B);
    return C.normalized();
  }
}
