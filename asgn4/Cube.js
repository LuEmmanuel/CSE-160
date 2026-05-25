class Cube {
  constructor() {
    this.type = "cube";
    this.color = [1, 1, 1, 1];
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    this.textureNum = -1;
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

    drawCube();
  }
}

// Each vertex:
// x, y, z,   u, v,   nx, ny, nz
const cubeVerticesUVNormal = new Float32Array([
  // Front face normal: 0, 0, 1
  0,0,1, 0,0, 0,0,1,
  1,0,1, 1,0, 0,0,1,
  1,1,1, 1,1, 0,0,1,
  0,0,1, 0,0, 0,0,1,
  1,1,1, 1,1, 0,0,1,
  0,1,1, 0,1, 0,0,1,

  // Back face normal: 0, 0, -1
  1,0,0, 0,0, 0,0,-1,
  0,0,0, 1,0, 0,0,-1,
  0,1,0, 1,1, 0,0,-1,
  1,0,0, 0,0, 0,0,-1,
  0,1,0, 1,1, 0,0,-1,
  1,1,0, 0,1, 0,0,-1,

  // Top face normal: 0, 1, 0
  0,1,1, 0,0, 0,1,0,
  1,1,1, 1,0, 0,1,0,
  1,1,0, 1,1, 0,1,0,
  0,1,1, 0,0, 0,1,0,
  1,1,0, 1,1, 0,1,0,
  0,1,0, 0,1, 0,1,0,

  // Bottom face normal: 0, -1, 0
  0,0,0, 0,0, 0,-1,0,
  1,0,0, 1,0, 0,-1,0,
  1,0,1, 1,1, 0,-1,0,
  0,0,0, 0,0, 0,-1,0,
  1,0,1, 1,1, 0,-1,0,
  0,0,1, 0,1, 0,-1,0,

  // Right face normal: 1, 0, 0
  1,0,1, 0,0, 1,0,0,
  1,0,0, 1,0, 1,0,0,
  1,1,0, 1,1, 1,0,0,
  1,0,1, 0,0, 1,0,0,
  1,1,0, 1,1, 1,0,0,
  1,1,1, 0,1, 1,0,0,

  // Left face normal: -1, 0, 0
  0,0,0, 0,0, -1,0,0,
  0,0,1, 1,0, -1,0,0,
  0,1,1, 1,1, -1,0,0,
  0,0,0, 0,0, -1,0,0,
  0,1,1, 1,1, -1,0,0,
  0,1,0, 0,1, -1,0,0,
]);

let cubeBuffer = null;

function initCubeBuffer() {
  cubeBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cubeVerticesUVNormal, gl.STATIC_DRAW);

  setupCubeAttributes();
}

function setupCubeAttributes() {
  const FSIZE = cubeVerticesUVNormal.BYTES_PER_ELEMENT;

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
}

function drawCube() {
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  setupCubeAttributes();
  gl.drawArrays(gl.TRIANGLES, 0, 36);
}