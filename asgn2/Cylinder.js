// Cylinder.js  ───────────────────────────────────────────────────────────────
// Procedurally-generated cylinder aligned on the Y axis,
// spanning y = [-0.5, 0.5], radius = 0.5.
//
// Geometry = N side quads (2 triangles each) + top cap + bottom cap.
// Total triangles = N * 4   →   vertices = N * 12
// ─────────────────────────────────────────────────────────────────────────────

class Cylinder {
  /**
   * @param {number} n - Number of sides (default 12)
   */
  constructor(n) {
    this.n = n || 12;
    this._buildVertices();
  }

  _buildVertices() {
    var n    = this.n;
    var step = (2 * Math.PI) / n;
    var verts = [];

    for (var i = 0; i < n; i++) {
      var a1 = i       * step;
      var a2 = (i + 1) * step;

      var x1 = 0.5 * Math.cos(a1),  z1 = 0.5 * Math.sin(a1);
      var x2 = 0.5 * Math.cos(a2),  z2 = 0.5 * Math.sin(a2);

      // ── Side quad (2 triangles) ───────────────────────────────────────
      verts.push(x1,-0.5,z1,  x2,-0.5,z2,  x2, 0.5,z2);
      verts.push(x1,-0.5,z1,  x2, 0.5,z2,  x1, 0.5,z1);

      // ── Top cap (y = +0.5) ───────────────────────────────────────────
      verts.push(0, 0.5, 0,  x1, 0.5, z1,  x2, 0.5, z2);

      // ── Bottom cap (y = -0.5) ─────────────────────────────────────────
      verts.push(0,-0.5, 0,  x2,-0.5, z2,  x1,-0.5, z1);
    }

    this.vertices  = new Float32Array(verts);
    this.vertCount = verts.length / 3;   // 3 coords per vertex
  }

  /**
   * Upload vertices to the shared g_vertexBuffer and draw.
   * Color and model matrix must already be set as uniforms.
   */
  render() {
    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, this.vertCount);
  }
}