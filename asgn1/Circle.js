// Circle.js

class Circle {
  constructor() {
    this.type = 'circle';
    this.position = [0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 10.0;
    this.segments = 12;
  }

  render() {
    let xy = this.position;
    let rgba = this.color;
    let radius = this.size / 200.0;
    let angleStep = 360 / this.segments;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    for (let angle = 0; angle < 360; angle += angleStep) {
      let angle1 = angle * Math.PI / 180;
      let angle2 = (angle + angleStep) * Math.PI / 180;

      let pt1 = [xy[0], xy[1]];
      let pt2 = [xy[0] + Math.cos(angle1) * radius, xy[1] + Math.sin(angle1) * radius];
      let pt3 = [xy[0] + Math.cos(angle2) * radius, xy[1] + Math.sin(angle2) * radius];

      drawTriangle([
        pt1[0], pt1[1],
        pt2[0], pt2[1],
        pt3[0], pt3[1]
      ]);
    }
  }
}