console.log("BlockyAnimal.js loaded");

// ─────────────────────────────────────────────
// Shaders
// ─────────────────────────────────────────────
const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;

  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;

  void main() {
    gl_FragColor = u_FragColor;
  }
`;

// ─────────────────────────────────────────────
// Global variables
// ─────────────────────────────────────────────
let canvas;
let gl;

let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let g_vertexBuffer = null;

let g_globalAngleX = 0;
let g_globalAngleY = 0;

// Front left
let g_frontLeftUpper = 0;
let g_frontLeftLower = 0;
let g_frontLeftPaw = 0;

// Front right
let g_frontRightUpper = 0;
let g_frontRightLower = 0;
let g_frontRightPaw = 0;

// Back left
let g_backLeftUpper = 0;
let g_backLeftLower = 0;
let g_backLeftPaw = 0;

// Back right
let g_backRightUpper = 0;
let g_backRightLower = 0;
let g_backRightPaw = 0;

let g_animation = false;
let g_pokeAnimation = false;

let g_startTime = performance.now() / 1000.0;
let g_seconds = 0;

let g_mouseDown = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  initTriangle3D();
  addActionsForHtmlUI();
  initMouseHandlers();

  gl.clearColor(0.92, 0.92, 0.92, 1.0);

  requestAnimationFrame(tick);
}

function setupWebGL() {
  canvas = document.getElementById("webgl");

  if (!canvas) {
    console.log("Failed to find canvas");
    return;
  }

  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

  if (!gl) {
    console.log("Failed to get WebGL context");
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to initialize shaders");
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get a_Position");
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get u_FragColor");
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get u_ModelMatrix");
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get u_GlobalRotateMatrix");
    return;
  }

  const identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identityM.elements);
}

function initTriangle3D() {
  g_vertexBuffer = gl.createBuffer();

  if (!g_vertexBuffer) {
    console.log("Failed to create vertex buffer");
  }
}

function drawTriangle3D(vertices) {
  const n = vertices.length / 3;

  gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

// ─────────────────────────────────────────────
// HTML controls
// ─────────────────────────────────────────────
function addActionsForHtmlUI() {
  document.getElementById("angleXSlide").addEventListener("input", function () {
    g_globalAngleX = Number(this.value);
    renderScene();
  });

  document.getElementById("angleYSlide").addEventListener("input", function () {
    g_globalAngleY = Number(this.value);
    renderScene();
  });

  document.getElementById("frontLeftUpperSlide").addEventListener("input", function () {
    g_frontLeftUpper = Number(this.value);
    renderScene();
  });

  document.getElementById("frontLeftLowerSlide").addEventListener("input", function () {
    g_frontLeftLower = Number(this.value);
    renderScene();
  });

  document.getElementById("frontLeftPawSlide").addEventListener("input", function () {
    g_frontLeftPaw = Number(this.value);
    renderScene();
  });

  document.getElementById("frontRightUpperSlide").addEventListener("input", function () {
    g_frontRightUpper = Number(this.value);
    renderScene();
  });

  document.getElementById("frontRightLowerSlide").addEventListener("input", function () {
    g_frontRightLower = Number(this.value);
    renderScene();
  });

  document.getElementById("frontRightPawSlide").addEventListener("input", function () {
    g_frontRightPaw = Number(this.value);
    renderScene();
  });

  document.getElementById("backLeftUpperSlide").addEventListener("input", function () {
    g_backLeftUpper = Number(this.value);
    renderScene();
  });

  document.getElementById("backLeftLowerSlide").addEventListener("input", function () {
    g_backLeftLower = Number(this.value);
    renderScene();
  });

  document.getElementById("backLeftPawSlide").addEventListener("input", function () {
    g_backLeftPaw = Number(this.value);
    renderScene();
  });

  document.getElementById("backRightUpperSlide").addEventListener("input", function () {
    g_backRightUpper = Number(this.value);
    renderScene();
  });

  document.getElementById("backRightLowerSlide").addEventListener("input", function () {
    g_backRightLower = Number(this.value);
    renderScene();
  });

  document.getElementById("backRightPawSlide").addEventListener("input", function () {
    g_backRightPaw = Number(this.value);
    renderScene();
  });

  document.getElementById("animationOnButton").onclick = function () {
    g_animation = true;
  };

  document.getElementById("animationOffButton").onclick = function () {
    g_animation = false;
  };
}

// ─────────────────────────────────────────────
// Mouse controls
// ─────────────────────────────────────────────
function initMouseHandlers() {
  canvas.onmousedown = function (ev) {
    if (ev.shiftKey) {
      g_pokeAnimation = true;

      setTimeout(() => {
        g_pokeAnimation = false;
      }, 1000);
    }

    g_mouseDown = true;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
  };

  canvas.onmouseup = function () {
    g_mouseDown = false;
  };

  canvas.onmouseleave = function () {
    g_mouseDown = false;
  };

  canvas.onmousemove = function (ev) {
    if (!g_mouseDown) return;

    const dx = ev.clientX - g_lastMouseX;
    const dy = ev.clientY - g_lastMouseY;

    g_globalAngleY += dx * 0.5;
    g_globalAngleX += dy * 0.5;

    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;

    renderScene();
  };
}

// ─────────────────────────────────────────────
// Animation
// Smaller stride so legs stay under body
// ─────────────────────────────────────────────
function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;

  updateAnimationAngles();
  renderScene();

  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (!g_animation) return;

  const t = g_seconds * 2.5;

  // Small diagonal walking gait
  g_frontLeftUpper = 14 * Math.sin(t);
  g_frontLeftLower = -10 * Math.sin(t + 0.6);
  g_frontLeftPaw = -6 * Math.sin(t + 1.1);

  g_backRightUpper = 12 * Math.sin(t);
  g_backRightLower = -8 * Math.sin(t + 0.6);
  g_backRightPaw = -5 * Math.sin(t + 1.1);

  g_frontRightUpper = 14 * Math.sin(t + Math.PI);
  g_frontRightLower = -10 * Math.sin(t + Math.PI + 0.6);
  g_frontRightPaw = -6 * Math.sin(t + Math.PI + 1.1);

  g_backLeftUpper = 12 * Math.sin(t + Math.PI);
  g_backLeftLower = -8 * Math.sin(t + Math.PI + 0.6);
  g_backLeftPaw = -5 * Math.sin(t + Math.PI + 1.1);

  // Poke animation: energetic but not explosive
  if (g_pokeAnimation) {
    g_frontLeftUpper = 35 * Math.sin(g_seconds * 12.0);
    g_frontRightUpper = -35 * Math.sin(g_seconds * 12.0);

    g_frontLeftLower = 18 * Math.sin(g_seconds * 12.0);
    g_frontRightLower = -18 * Math.sin(g_seconds * 12.0);

    g_frontLeftPaw = 12 * Math.sin(g_seconds * 12.0);
    g_frontRightPaw = -12 * Math.sin(g_seconds * 12.0);
  }
}

// ─────────────────────────────────────────────
// renderScene()
// Centered panda with larger body, smaller legs
// ─────────────────────────────────────────────
function renderScene() {
  const startTime = performance.now();

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngleX, 1, 0, 0);
  globalRotMat.rotate(g_globalAngleY, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  const bodyBob = g_animation ? 0.012 * Math.sin(g_seconds * 2.5) : 0;
  const headTilt = g_animation ? 3.5 * Math.sin(g_seconds * 2.2) : 0;
  const tailWag = g_animation ? 20 * Math.sin(g_seconds * 4.5) : 0;

  // Body dimensions:
  // width x height x depth = 0.60 x 0.40 x 0.35
  // Origin is centered around world x/z.
  let bodyBase = new Matrix4();
  bodyBase.translate(-0.30, -0.28 + bodyBob, -0.175);

  // BODY
  drawCubeFrom(bodyBase, [0, 0, 0], [0.60, 0.40, 0.35], [1, 1, 1, 1]);

  // BLACK BODY PATCHES
  drawCubeFrom(bodyBase, [0.03, 0.08, -0.012], [0.13, 0.18, 0.37], [0, 0, 0, 1]);
  drawCubeFrom(bodyBase, [0.44, 0.08, -0.012], [0.13, 0.18, 0.37], [0, 0, 0, 1]);

  // HEAD / NECK JOINT
  let neckJoint = new Matrix4(bodyBase);
  neckJoint.translate(0.30, 0.39, 0.055);
  neckJoint.rotate(headTilt, 0, 0, 1);

  let headBase = new Matrix4(neckJoint);
  headBase.translate(-0.18, -0.01, -0.02);

  // HEAD
  drawCubeFrom(headBase, [0, 0, 0], [0.36, 0.27, 0.24], [1, 1, 1, 1]);

  // EARS
  drawCubeFrom(headBase, [0.03, 0.23, 0.04], [0.08, 0.08, 0.08], [0, 0, 0, 1]);
  drawCubeFrom(headBase, [0.25, 0.23, 0.04], [0.08, 0.08, 0.08], [0, 0, 0, 1]);

  // EYE PATCHES
  drawCubeFrom(headBase, [0.060, 0.110, -0.012], [0.075, 0.085, 0.014], [0, 0, 0, 1]);
  drawCubeFrom(headBase, [0.225, 0.110, -0.012], [0.075, 0.085, 0.014], [0, 0, 0, 1]);

  // EYE WHITES
  drawCubeFrom(headBase, [0.085, 0.145, -0.026], [0.022, 0.022, 0.010], [1, 1, 1, 1]);
  drawCubeFrom(headBase, [0.250, 0.145, -0.026], [0.022, 0.022, 0.010], [1, 1, 1, 1]);

  // PUPILS
  drawCubeFrom(headBase, [0.093, 0.150, -0.034], [0.010, 0.010, 0.008], [0, 0, 0, 1]);
  drawCubeFrom(headBase, [0.258, 0.150, -0.034], [0.010, 0.010, 0.008], [0, 0, 0, 1]);

  // SNOUT + NOSE
  drawCubeFrom(headBase, [0.120, 0.055, -0.025], [0.130, 0.075, 0.040], [1, 1, 1, 1]);
  drawCubeFrom(headBase, [0.155, 0.085, -0.042], [0.050, 0.035, 0.018], [0, 0, 0, 1]);

  // LEGS
  // Small legs tucked under larger body.
  drawLegChain(bodyBase, 0.10, -0.02, -0.04, g_frontLeftUpper, g_frontLeftLower, g_frontLeftPaw);
  drawLegChain(bodyBase, 0.42, -0.02, -0.04, g_frontRightUpper, g_frontRightLower, g_frontRightPaw);
  drawLegChain(bodyBase, 0.10, -0.02, 0.22, g_backLeftUpper, g_backLeftLower, g_backLeftPaw);
  drawLegChain(bodyBase, 0.42, -0.02, 0.22, g_backRightUpper, g_backRightLower, g_backRightPaw);

  // TAIL
  let tailJoint = new Matrix4(bodyBase);
  tailJoint.translate(0.58, 0.18, 0.15);
  tailJoint.rotate(tailWag, 0, 1, 0);
  drawCubeFrom(tailJoint, [0, -0.02, 0], [0.06, 0.06, 0.09], [0, 0, 0, 1]);

  // BAMBOO BASE
  let bambooBase = new Matrix4();
  bambooBase.translate(0.50, -0.28, 0.05);

  // BAMBOO POLE
  let bamboo = new Cylinder(16);
  bamboo.color = [0.2, 0.70, 0.20, 1.0];
  bamboo.matrix = new Matrix4(bambooBase);
  bamboo.matrix.scale(0.055, 0.65, 0.055);
  bamboo.render();

  // BAMBOO LEAVES
  drawLeaf(bambooBase, 0.00, 0.42, 0.00, 30, 10);
  drawLeaf(bambooBase, -0.10, 0.28, 0.00, -35, -10);
  drawLeaf(bambooBase, 0.02, 0.52, 0.00, 45, 15);

  const duration = performance.now() - startTime;
  sendTextToHTML("FPS: " + (1000 / duration).toFixed(1), "fps");
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function drawLegChain(parentMatrix, x, y, z, upperAngle, lowerAngle, pawAngle) {
  let upperBase = new Matrix4(parentMatrix);
  upperBase.translate(x, y, z);
  upperBase.rotate(upperAngle, 1, 0, 0);

  let upper = new Cube();
  upper.color = [0, 0, 0, 1];
  upper.matrix = new Matrix4(upperBase);
  upper.matrix.scale(0.07, 0.13, 0.07);
  upper.render();

  let lowerBase = new Matrix4(upperBase);
  lowerBase.translate(0.0, -0.13, 0.0);
  lowerBase.rotate(lowerAngle, 1, 0, 0);

  let lower = new Cube();
  lower.color = [0, 0, 0, 1];
  lower.matrix = new Matrix4(lowerBase);
  lower.matrix.scale(0.06, 0.11, 0.06);
  lower.render();

  let pawBase = new Matrix4(lowerBase);
  pawBase.translate(0.0, -0.09, -0.02);
  pawBase.rotate(pawAngle, 1, 0, 0);

  let paw = new Cube();
  paw.color = [0, 0, 0, 1];
  paw.matrix = new Matrix4(pawBase);
  paw.matrix.scale(0.09, 0.045, 0.11);
  paw.render();
}

function drawLeaf(parentMatrix, x, y, z, zAngle, yAngle) {
  let leaf = new Cube();
  leaf.color = [0.15, 0.65, 0.15, 1];
  leaf.matrix = new Matrix4(parentMatrix);
  leaf.matrix.translate(x, y, z);
  leaf.matrix.rotate(zAngle, 0, 0, 1);
  leaf.matrix.rotate(yAngle, 0, 1, 0);
  leaf.matrix.scale(0.14, 0.018, 0.045);
  leaf.render();

  let tip = new Cube();
  tip.color = [0.13, 0.55, 0.13, 1];
  tip.matrix = new Matrix4(leaf.matrix);
  tip.matrix.translate(0.85, 0, 0);
  tip.matrix.scale(0.45, 0.9, 0.9);
  tip.render();
}

function drawCubeFrom(parentMatrix, translate, scale, color) {
  let cube = new Cube();
  cube.color = color;
  cube.matrix = new Matrix4(parentMatrix);
  cube.matrix.translate(translate[0], translate[1], translate[2]);
  cube.matrix.scale(scale[0], scale[1], scale[2]);
  cube.render();
}

function sendTextToHTML(text, htmlID) {
  const htmlElm = document.getElementById(htmlID);

  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }

  htmlElm.innerHTML = text;
}