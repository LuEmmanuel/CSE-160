class Animal {
  constructor(x, y, z, scale = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.scale = scale;
    this.found = false;
  }

  render() {
    if (this.found) return;

    // Body
    let body = new Cube();
    body.textureNum = -1;
    body.color = [0.95, 0.95, 0.95, 1];
    body.matrix.translate(this.x, this.y, this.z);
    body.matrix.scale(0.8 * this.scale, 0.5 * this.scale, 0.5 * this.scale);
    body.render();

    // Head
    let head = new Cube();
    head.textureNum = -1;
    head.color = [0.95, 0.95, 0.95, 1];
    head.matrix.translate(this.x + 0.2 * this.scale, this.y + 0.45 * this.scale, this.z + 0.1 * this.scale);
    head.matrix.scale(0.45 * this.scale, 0.45 * this.scale, 0.45 * this.scale);
    head.render();

    // Ear left
    let ear1 = new Cube();
    ear1.textureNum = -1;
    ear1.color = [0.05, 0.05, 0.05, 1];
    ear1.matrix.translate(this.x + 0.15 * this.scale, this.y + 0.85 * this.scale, this.z + 0.1 * this.scale);
    ear1.matrix.scale(0.18 * this.scale, 0.18 * this.scale, 0.18 * this.scale);
    ear1.render();

    // Ear right
    let ear2 = new Cube();
    ear2.textureNum = -1;
    ear2.color = [0.05, 0.05, 0.05, 1];
    ear2.matrix.translate(this.x + 0.55 * this.scale, this.y + 0.85 * this.scale, this.z + 0.1 * this.scale);
    ear2.matrix.scale(0.18 * this.scale, 0.18 * this.scale, 0.18 * this.scale);
    ear2.render();

    // Legs
    for (let i = 0; i < 4; i++) {
      let leg = new Cube();
      leg.textureNum = -1;
      leg.color = [0.05, 0.05, 0.05, 1];

      let lx = this.x + (i < 2 ? 0.1 : 0.55) * this.scale;
      let lz = this.z + (i % 2 === 0 ? 0.05 : 0.35) * this.scale;

      leg.matrix.translate(lx, this.y - 0.35 * this.scale, lz);
      leg.matrix.scale(0.18 * this.scale, 0.35 * this.scale, 0.18 * this.scale);
      leg.render();
    }
  }


  checkFound(camera) {
  if (this.found) return false;

  let dx = camera.eye.elements[0] - this.x;
  let dy = camera.eye.elements[1] - this.y;
  let dz = camera.eye.elements[2] - this.z;

  let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Must walk very close to the panda
  if (dist < 1.8) {
    this.found = true;
    return true;
  }

  return false;
}
 


}