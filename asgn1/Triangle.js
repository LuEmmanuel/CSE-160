class Triangle {
  constructor() {
    this.type = 'triangle';
    this.position = [0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 10.0;
    this.vertices = null;
    this.useCustomVertices = false;
  }

  render() {
    let rgba = this.color;
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    if (this.useCustomVertices && this.vertices) {
      drawTriangle(this.vertices);
      return;
    }

    let xy = this.position;
    let d = this.size / 200.0;

    drawTriangle([
      xy[0],     xy[1] + d,
      xy[0] - d, xy[1] - d,
      xy[0] + d, xy[1] - d
    ]);
  }
}