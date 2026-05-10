class Cube {
  constructor() {
    this.type = "cube";
    this.color = [1, 1, 1, 1];
    this.matrix = new Matrix4();
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

    drawCube();
  }
}

const cubeVerticesUV = new Float32Array([
  // Front
  0,0,1, 0,0,
  1,0,1, 1,0,
  1,1,1, 1,1,
  0,0,1, 0,0,
  1,1,1, 1,1,
  0,1,1, 0,1,

  // Back
  1,0,0, 0,0,
  0,0,0, 1,0,
  0,1,0, 1,1,
  1,0,0, 0,0,
  0,1,0, 1,1,
  1,1,0, 0,1,

  // Top
  0,1,1, 0,0,
  1,1,1, 1,0,
  1,1,0, 1,1,
  0,1,1, 0,0,
  1,1,0, 1,1,
  0,1,0, 0,1,

  // Bottom
  0,0,0, 0,0,
  1,0,0, 1,0,
  1,0,1, 1,1,
  0,0,0, 0,0,
  1,0,1, 1,1,
  0,0,1, 0,1,

  // Right
  1,0,1, 0,0,
  1,0,0, 1,0,
  1,1,0, 1,1,
  1,0,1, 0,0,
  1,1,0, 1,1,
  1,1,1, 0,1,

  // Left
  0,0,0, 0,0,
  0,0,1, 1,0,
  0,1,1, 1,1,
  0,0,0, 0,0,
  0,1,1, 1,1,
  0,1,0, 0,1,
]);

let cubeBuffer = null;

function initCubeBuffer() {
  cubeBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cubeVerticesUV, gl.STATIC_DRAW);

  const FSIZE = cubeVerticesUV.BYTES_PER_ELEMENT;

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
  gl.enableVertexAttribArray(a_UV);
}

function drawCube() {
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);

  const FSIZE = cubeVerticesUV.BYTES_PER_ELEMENT;

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
  gl.enableVertexAttribArray(a_UV);

  gl.drawArrays(gl.TRIANGLES, 0, 36);
}