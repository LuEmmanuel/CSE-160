// ColoredPoints.js

// Vertex shader
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }
`;

// Fragment shader
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
`;

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const ERASER = 3;

// Globals
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

let g_shapesList = [];
let g_selectedColor = [1.0, 0.0, 0.0, 1.0];
let g_selectedSize = 12.0;
let g_selectedSegments = 12;
let g_selectedType = POINT;

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  canvas.onmousedown = function(ev) {
    handleClicks(ev);
  };

  canvas.onmousemove = function(ev) {
    if (ev.buttons === 1) {
      handleClicks(ev);
    }
  };

  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  renderAllShapes();
  updateModeText();
  updateActiveButtons();
}

function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
  }
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

function addActionsForHtmlUI() {
  document.getElementById('redSlide').addEventListener('input', function() {
    g_selectedColor[0] = this.value / 100;
  });

  document.getElementById('greenSlide').addEventListener('input', function() {
    g_selectedColor[1] = this.value / 100;
  });

  document.getElementById('blueSlide').addEventListener('input', function() {
    g_selectedColor[2] = this.value / 100;
  });

  document.getElementById('sizeSlide').addEventListener('input', function() {
    g_selectedSize = Number(this.value);
  });

  document.getElementById('segmentSlide').addEventListener('input', function() {
    g_selectedSegments = Number(this.value);
  });

  document.getElementById('pointButton').onclick = function() {
    g_selectedType = POINT;
    updateModeText();
    updateActiveButtons();
  };

  document.getElementById('triangleButton').onclick = function() {
    g_selectedType = TRIANGLE;
    updateModeText();
    updateActiveButtons();
  };

  document.getElementById('circleButton').onclick = function() {
    g_selectedType = CIRCLE;
    updateModeText();
    updateActiveButtons();
  };

  document.getElementById('eraserButton').onclick = function() {
    g_selectedType = ERASER;
    updateModeText();
    updateActiveButtons();
  };

  document.getElementById('clearButton').onclick = function() {
    g_shapesList = [];
    renderAllShapes();
  };

  document.getElementById('undoButton').onclick = function() {
    g_shapesList.pop();
    renderAllShapes();
  };

  document.getElementById('pictureButton').onclick = function() {
    addPresetPicture();
    renderAllShapes();
  };
}

function handleClicks(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);
  let shape;

  if (g_selectedType === POINT) {
    shape = new Point();
    shape.color = [...g_selectedColor];
  } else if (g_selectedType === TRIANGLE) {
    shape = new Triangle();
    shape.color = [...g_selectedColor];
  } else if (g_selectedType === CIRCLE) {
    shape = new Circle();
    shape.color = [...g_selectedColor];
    shape.segments = g_selectedSegments;
  } else if (g_selectedType === ERASER) {
    shape = new Point();
    shape.color = [1.0, 1.0, 1.0, 1.0];
  }

  shape.position = [x, y];
  shape.size = g_selectedSize;

  g_shapesList.push(shape);
  renderAllShapes();
}

function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  for (let i = 0; i < g_shapesList.length; i++) {
    g_shapesList[i].render();
  }
}

function convertCoordinatesEventToGL(ev) {
  let x = ev.clientX;
  let y = ev.clientY;
  let rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

function drawTriangle(vertices) {
  let n = 3;

  let vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function updateModeText() {
  let status = document.getElementById('statusText');

  if (g_selectedType === POINT) {
    status.textContent = 'Mode: Point';
  } else if (g_selectedType === TRIANGLE) {
    status.textContent = 'Mode: Triangle';
  } else if (g_selectedType === CIRCLE) {
    status.textContent = 'Mode: Circle';
  } else if (g_selectedType === ERASER) {
    status.textContent = 'Mode: Eraser';
  }
}

function updateActiveButtons() {
  let pointBtn = document.getElementById('pointButton');
  let triangleBtn = document.getElementById('triangleButton');
  let circleBtn = document.getElementById('circleButton');
  let eraserBtn = document.getElementById('eraserButton');

  pointBtn.classList.remove('mode-active');
  triangleBtn.classList.remove('mode-active');
  circleBtn.classList.remove('mode-active');
  eraserBtn.classList.remove('mode-active');

  if (g_selectedType === POINT) {
    pointBtn.classList.add('mode-active');
  } else if (g_selectedType === TRIANGLE) {
    triangleBtn.classList.add('mode-active');
  } else if (g_selectedType === CIRCLE) {
    circleBtn.classList.add('mode-active');
  } else if (g_selectedType === ERASER) {
    eraserBtn.classList.add('mode-active');
  }
}

// Picture feature: mountains + sun + river
function addPresetPicture() {
  // Uncomment if you want the picture button to clear the canvas first
  // g_shapesList = [];

  const sky = [0.85, 0.93, 1.00, 1.0];
  const ground = [0.84, 0.95, 0.84, 1.0];
  const mountainBack = [0.65, 0.75, 0.90, 1.0];
  const mountainMid = [0.55, 0.66, 0.82, 1.0];
  const mountainFront = [0.45, 0.58, 0.74, 1.0];
  const snow = [0.96, 0.96, 0.98, 1.0];
  const sun = [1.00, 0.85, 0.20, 1.0];
  const river = [0.35, 0.65, 0.95, 1.0];
  const riverLight = [0.75, 0.88, 1.00, 1.0];
  const line = [0.20, 0.28, 0.40, 1.0];

  // Sky
  addTriangleShape(-1.0,  1.0,  1.0,  1.0, -1.0, -0.05, sky);
  addTriangleShape( 1.0,  1.0,  1.0, -0.05, -1.0, -0.05, sky);

  // Ground
  addTriangleShape(-1.0, -0.05,  1.0, -0.05, -1.0, -1.0, ground);
  addTriangleShape( 1.0, -0.05,  1.0, -1.0, -1.0, -1.0, ground);

  // Back mountain
  addTriangleShape(-0.45, -0.05, 0.05, 0.72, 0.72, -0.05, mountainBack);
  addTriangleShape(-0.45, -0.05, 0.72, -0.05, 0.20, 0.15, mountainMid);

  // Snow cap on back mountain
  addTriangleShape(-0.05, 0.42, 0.05, 0.72, 0.18, 0.42, snow);

  // Left/front mountain
  addTriangleShape(-0.92, -0.05, -0.58, 0.40, -0.05, -0.05, mountainFront);
  addTriangleShape(-0.92, -0.05, -0.05, -0.05, -0.38, 0.12, mountainMid);

  // Snow cap left mountain
  addTriangleShape(-0.52, 0.16, -0.58, 0.40, -0.34, 0.16, snow);

  // Right/front mountain
  addTriangleShape(0.05, -0.05, 0.40, 0.36, 0.82, -0.05, mountainFront);
  addTriangleShape(0.05, -0.05, 0.82, -0.05, 0.48, 0.10, mountainMid);

  // Snow cap right mountain
  addTriangleShape(0.30, 0.16, 0.40, 0.36, 0.54, 0.16, snow);

  // Sun
  addCircleShape(-0.40, 0.68, 50, sun, 24);

  // River segments
  addTriangleShape(-0.03, -0.05, 0.10, -0.05, 0.02, -0.18, river);
  addTriangleShape( 0.10, -0.05, 0.16, -0.20, 0.02, -0.18, riverLight);

  addTriangleShape(-0.10, -0.18, 0.16, -0.20, -0.02, -0.35, river);
  addTriangleShape( 0.16, -0.20, 0.22, -0.38, -0.02, -0.35, riverLight);

  addTriangleShape(-0.24, -0.35, 0.22, -0.38, -0.10, -0.58, river);
  addTriangleShape( 0.22, -0.38, 0.24, -0.75, -0.10, -0.58, riverLight);

  addTriangleShape(-0.34, -0.58, 0.24, -0.75, -0.42, -1.00, river);
  addTriangleShape( 0.24, -0.75, 0.20, -1.00, -0.42, -1.00, riverLight);

  // Decorative mountain detail lines as tiny triangles
  addTriangleShape(-0.02, 0.46, 0.00, 0.56, 0.03, 0.44, line);
  addTriangleShape(0.10, 0.34, 0.12, 0.48, 0.15, 0.34, line);

  addTriangleShape(-0.48, 0.10, -0.45, 0.22, -0.42, 0.08, line);
  addTriangleShape(-0.34, 0.06, -0.31, 0.18, -0.28, 0.04, line);

  addTriangleShape(0.28, 0.10, 0.31, 0.24, 0.34, 0.08, line);
  addTriangleShape(0.44, 0.06, 0.47, 0.18, 0.50, 0.04, line);
}

function addTriangleShape(x1, y1, x2, y2, x3, y3, color) {
  let t = new Triangle();
  t.color = color;
  t.vertices = [x1, y1, x2, y2, x3, y3];
  t.useCustomVertices = true;
  g_shapesList.push(t);
}

function addCircleShape(x, y, size, color, segments) {
  let c = new Circle();
  c.position = [x, y];
  c.size = size;
  c.color = color;
  c.segments = segments;
  g_shapesList.push(c);
}