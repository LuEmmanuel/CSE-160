class Sphere {
  constructor(segments = 24) {
    this.type = "sphere";
    this.color = [1, 1, 1, 1];
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    this.textureNum = -1;
    this.segments = segments;

    this.vertices = [];
    this.buffer = null;

    this.generateSphere();
    this.initBuffer();
  }

  generateSphere() {
    const latBands = this.segments;
    const lonBands = this.segments;

    for (let lat = 0; lat < latBands; lat++) {
      const theta1 = (lat * Math.PI) / latBands;
      const theta2 = ((lat + 1) * Math.PI) / latBands;

      for (let lon = 0; lon < lonBands; lon++) {
        const phi1 = (lon * 2 * Math.PI) / lonBands;
        const phi2 = ((lon + 1) * 2 * Math.PI) / lonBands;

        const p1 = this.spherePoint(theta1, phi1);
        const p2 = this.spherePoint(theta2, phi1);
        const p3 = this.spherePoint(theta2, phi2);
        const p4 = this.spherePoint(theta1, phi2);

        const uv1 = [lon / lonBands, lat / latBands];
        const uv2 = [lon / lonBands, (lat + 1) / latBands];
        const uv3 = [(lon + 1) / lonBands, (lat + 1) / latBands];
        const uv4 = [(lon + 1) / lonBands, lat / latBands];

        // Triangle 1
        this.addVertex(p1, uv1);
        this.addVertex(p2, uv2);
        this.addVertex(p3, uv3);

        // Triangle 2
        this.addVertex(p1, uv1);
        this.addVertex(p3, uv3);
        this.addVertex(p4, uv4);
      }
    }
  }

  spherePoint(theta, phi) {
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.cos(theta);
    const z = Math.sin(theta) * Math.sin(phi);

    return [x, y, z];
  }

  addVertex(pos, uv) {
    const x = pos[0];
    const y = pos[1];
    const z = pos[2];

    // For a sphere centered at origin, normal = position normalized.
    this.vertices.push(
      x, y, z,
      uv[0], uv[1],
      x, y, z
    );
  }

  initBuffer() {
    this.buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
  }

  render() {
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

    // Position: x, y, z
    gl.vertexAttribPointer(
      a_Position,
      3,
      gl.FLOAT,
      false,
      FSIZE * 8,
      0
    );
    gl.enableVertexAttribArray(a_Position);

    // UV: u, v
    gl.vertexAttribPointer(
      a_UV,
      2,
      gl.FLOAT,
      false,
      FSIZE * 8,
      FSIZE * 3
    );
    gl.enableVertexAttribArray(a_UV);

    // Normal: nx, ny, nz
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