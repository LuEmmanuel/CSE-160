let canvas;
let gl;

let a_Position;
let a_UV;

let u_ModelMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_BaseColor;
let u_WhichTexture;

let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;

let camera;
let world;

let keys = {};

let lastMouseX = null;
let lastMouseY = null;
let mouseDown = false;

const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;

  varying vec2 v_UV;

  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;

  varying vec2 v_UV;

  uniform vec4 u_BaseColor;
  uniform int u_WhichTexture;

  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;

  void main() {
    if (u_WhichTexture == -1) {
      gl_FragColor = u_BaseColor;
    } else if (u_WhichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_WhichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_WhichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_WhichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else {
      gl_FragColor = u_BaseColor;
    }
  }
`;

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  initCubeBuffer();
  initTextures();

  camera = new Camera(canvas);
  world = new World();

  setupInput();

  gl.clearColor(0.45, 0.7, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  requestAnimationFrame(tick);
}

function setupWebGL() {
  canvas = document.getElementById("webgl");

  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

  if (!gl) {
    console.log("Failed to get WebGL context.");
    return;
  }
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to initialize shaders.");
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  a_UV = gl.getAttribLocation(gl.program, "a_UV");

  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  u_BaseColor = gl.getUniformLocation(gl.program, "u_BaseColor");
  u_WhichTexture = gl.getUniformLocation(gl.program, "u_WhichTexture");

  u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
  u_Sampler2 = gl.getUniformLocation(gl.program, "u_Sampler2");
  u_Sampler3 = gl.getUniformLocation(gl.program, "u_Sampler3");
}

function initTextures() {
  loadTexture("textures/grass.png", 0, u_Sampler0);
  loadTexture("textures/wall.png", 1, u_Sampler1);
  loadTexture("textures/stone.png", 2, u_Sampler2);
  loadTexture("textures/dirt.png", 3, u_Sampler3);
}

function loadTexture(path, textureUnit, sampler) {
  const texture = gl.createTexture();
  const image = new Image();

  image.onload = function () {
    console.log("Loaded texture:", path);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

   // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
   // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.RGBA,
  gl.RGBA,
  gl.UNSIGNED_BYTE,
  image
);
//gl.generateMipmap(gl.TEXTURE_2D);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.uniform1i(sampler, textureUnit);
  };

  image.onerror = function () {
    console.log("FAILED texture:", path);
  };

  image.src = path;
}

function setupInput() {
  document.onkeydown = function (event) {
    keys[event.key.toLowerCase()] = true;

    if (event.key.toLowerCase() === "f") {
      world.addBlock(camera);
    }

    if (event.key.toLowerCase() === "r") {
      world.removeBlock(camera);
    }

    if (event.key.toLowerCase() === "p") {
  world.restartGame();
}
  };

  document.onkeyup = function (event) {
    keys[event.key.toLowerCase()] = false;
  };

  canvas.onmousedown = function (event) {
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  };

  canvas.onmouseup = function () {
    mouseDown = false;
    lastMouseX = null;
    lastMouseY = null;
  };

  canvas.onmouseleave = function () {
    mouseDown = false;
    lastMouseX = null;
    lastMouseY = null;
  };

  canvas.onmousemove = function (event) {
    if (!mouseDown) return;

    if (lastMouseX === null || lastMouseY === null) {
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
      return;
    }

    let deltaX = event.clientX - lastMouseX;
    let deltaY = event.clientY - lastMouseY;

    if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30) {
      camera.mousePan(deltaX, deltaY);
    }

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  };
}

function handleMovement() {
  if (keys["w"]) {
    camera.moveForward();
  }

  if (keys["s"]) {
    camera.moveBackward();
  }

  if (keys["a"]) {
    camera.moveLeft();
  }

  if (keys["d"]) {
    camera.moveRight();
  }

  if (keys["q"]) {
    camera.panLeft();
  }

  if (keys["e"]) {
    camera.panRight();
  }
}

function tick() {
  handleMovement();
  world.checkGame(camera);
  renderScene();

  requestAnimationFrame(tick);
}

function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

  world.render();
}

main();