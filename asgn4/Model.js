class Model {
  constructor(filePath) {
    this.filePath = filePath;

    this.color = [1, 0.85, 0.25, 1]; // Homer-ish yellow
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    this.textureNum = -1;

    this.vertices = [];
    this.positions = [];
    this.buffer = null;
    this.loaded = false;

    this.loadOBJ(filePath);
  }

  async loadOBJ(filePath) {
    const response = await fetch(filePath);
    const text = await response.text();

    this.parseOBJ(text);
    this.initBuffer();

    this.loaded = true;
    console.log("Loaded OBJ:", filePath);
  }

  parseOBJ(text) {
    const lines = text.split("\n");

    for (let line of lines) {
      line = line.trim();

      if (line.length === 0 || line.startsWith("#")) {
        continue;
      }

      const parts = line.split(/\s+/);

      if (parts[0] === "v") {
        const x = parseFloat(parts[1]);
        const y = parseFloat(parts[2]);
        const z = parseFloat(parts[3]);

        this.positions.push([x, y, z]);
      }

      if (parts[0] === "f") {
        const i1 = parseInt(parts[1]) - 1;
        const i2 = parseInt(parts[2]) - 1;
        const i3 = parseInt(parts[3]) - 1;

        const p1 = this.positions[i1];
        const p2 = this.positions[i2];
        const p3 = this.positions[i3];

        this.addTriangle(p1, p2, p3);
      }
    }
  }

  addTriangle(p1, p2, p3) {
    const normal = this.computeNormal(p1, p2, p3);

    this.addVertex(p1, normal);
    this.addVertex(p2, normal);
    this.addVertex(p3, normal);
  }

  addVertex(position, normal) {
    // Format:
    // x, y, z,   u, v,   nx, ny, nz
    this.vertices.push(
      position[0], position[1], position[2],
      0, 0,
      normal[0], normal[1], normal[2]
    );
  }

  computeNormal(p1, p2, p3) {
    const ux = p2[0] - p1[0];
    const uy = p2[1] - p1[1];
    const uz = p2[2] - p1[2];

    const vx = p3[0] - p1[0];
    const vy = p3[1] - p1[1];
    const vz = p3[2] - p1[2];

    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;

    const length = Math.sqrt(nx * nx + ny * ny + nz * nz);

    if (length > 0.00001) {
      nx /= length;
      ny /= length;
      nz /= length;
    }

    return [nx, ny, nz];
  }

  initBuffer() {
    this.buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.vertices),
      gl.STATIC_DRAW
    );
  }

  render() {
    if (!this.loaded) {
      return;
    }

    gl.uniform1i(u_WhichTexture, this.textureNum);

    gl.uniform4f(
      u_BaseColor,
      this.color[0],
      this.color[1],
      this.color[2],
      this.color[3]
    );

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    this.normalMatrix.setInverseOf(this.matrix);
    this.normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    const FSIZE = Float32Array.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(
      a_Position,
      3,
      gl.FLOAT,
      false,
      FSIZE * 8,
      0
    );
    gl.enableVertexAttribArray(a_Position);

    gl.vertexAttribPointer(
      a_UV,
      2,
      gl.FLOAT,
      false,
      FSIZE * 8,
      FSIZE * 3
    );
    gl.enableVertexAttribArray(a_UV);

    gl.vertexAttribPointer(
      a_Normal,
      3,
      gl.FLOAT,
      false,
      FSIZE * 8,
      FSIZE * 5
    );
    gl.enableVertexAttribArray(a_Normal);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 8);
  }
}