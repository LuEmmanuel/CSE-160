let canvas;
let gl;

let a_Position;
let a_UV;
let a_Normal;

let u_ModelMatrix;
let u_NormalMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_BaseColor;
let u_WhichTexture;

let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;

let u_LightPos;
let u_CameraPos;
let u_LightColor;
let u_LightingOn;
let u_NormalOn;

let u_SpotlightOn;
let u_SpotPos;
let u_SpotDir;
let u_SpotCutoff;

let camera;
let world;

let keys = {};

let lastMouseX = null;
let lastMouseY = null;
let mouseDown = false;

let g_lightPos = [16, 8, 16];
let g_lightColor = [1.0, 1.0, 1.0];
let g_lightingOn = true;
let g_normalOn = false;
let g_lightAngle = 0;

let g_spotlightOn = true;
let g_spotPos = [16, 6, 28];
let g_spotDir = [0, -0.3, -1];
let g_spotCutoff = 0.92;

const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;

  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec3 v_WorldPos;

  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;

    v_UV = a_UV;

    vec4 worldPos = u_ModelMatrix * a_Position;
    v_WorldPos = worldPos.xyz;

    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 0.0)));
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;

  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec3 v_WorldPos;

  uniform vec4 u_BaseColor;
  uniform int u_WhichTexture;

  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;

  uniform vec3 u_LightPos;
  uniform vec3 u_CameraPos;
  uniform vec3 u_LightColor;
  uniform bool u_LightingOn;
  uniform bool u_NormalOn;

  uniform bool u_SpotlightOn;
  uniform vec3 u_SpotPos;
  uniform vec3 u_SpotDir;
  uniform float u_SpotCutoff;

  void main() {
    vec4 baseColor;

    if (u_WhichTexture == -1) {
      baseColor = u_BaseColor;
    } else if (u_WhichTexture == 0) {
      baseColor = texture2D(u_Sampler0, v_UV);
    } else if (u_WhichTexture == 1) {
      baseColor = texture2D(u_Sampler1, v_UV);
    } else if (u_WhichTexture == 2) {
      baseColor = texture2D(u_Sampler2, v_UV);
    } else if (u_WhichTexture == 3) {
      baseColor = texture2D(u_Sampler3, v_UV);
    } else {
      baseColor = u_BaseColor;
    }

    if (u_NormalOn) {
      gl_FragColor = vec4((normalize(v_Normal) + 1.0) / 2.0, 1.0);
      return;
    }

    if (!u_LightingOn) {
      gl_FragColor = baseColor;
      return;
    }

    vec3 normal = normalize(v_Normal);
    vec3 viewDir = normalize(u_CameraPos - v_WorldPos);

    vec3 lightDir = normalize(u_LightPos - v_WorldPos);
    vec3 reflectDir = reflect(-lightDir, normal);

    float nDotL = max(dot(normal, lightDir), 0.0);

    vec3 ambient = 0.25 * baseColor.rgb;
    vec3 diffuse = nDotL * baseColor.rgb * u_LightColor;

    float specAmount = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    vec3 specular = 0.5 * specAmount * u_LightColor;

    vec3 finalColor = ambient + diffuse + specular;

    if (u_SpotlightOn) {
      vec3 spotLightDir = normalize(u_SpotPos - v_WorldPos);
      vec3 spotToFragmentDir = normalize(v_WorldPos - u_SpotPos);

      float theta = dot(spotToFragmentDir, normalize(u_SpotDir));

      if (theta > u_SpotCutoff) {
        float spotStrength = smoothstep(u_SpotCutoff, 1.0, theta);

        float spotDiffuseAmount = max(dot(normal, spotLightDir), 0.0);
        vec3 spotDiffuse =
          spotStrength * spotDiffuseAmount * baseColor.rgb * vec3(1.0, 0.95, 0.75);

        vec3 spotReflectDir = reflect(-spotLightDir, normal);
        float spotSpecAmount = pow(max(dot(viewDir, spotReflectDir), 0.0), 32.0);
        vec3 spotSpecular =
          spotStrength * 0.7 * spotSpecAmount * vec3(1.0, 0.95, 0.75);

        finalColor += spotDiffuse + spotSpecular;
      }
    }

    gl_FragColor = vec4(finalColor, baseColor.a);
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
  setupUI();

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
  a_Normal = gl.getAttribLocation(gl.program, "a_Normal");

  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  u_BaseColor = gl.getUniformLocation(gl.program, "u_BaseColor");
  u_WhichTexture = gl.getUniformLocation(gl.program, "u_WhichTexture");

  u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
  u_Sampler2 = gl.getUniformLocation(gl.program, "u_Sampler2");
  u_Sampler3 = gl.getUniformLocation(gl.program, "u_Sampler3");

  u_LightPos = gl.getUniformLocation(gl.program, "u_LightPos");
  u_CameraPos = gl.getUniformLocation(gl.program, "u_CameraPos");
  u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");
  u_LightingOn = gl.getUniformLocation(gl.program, "u_LightingOn");
  u_NormalOn = gl.getUniformLocation(gl.program, "u_NormalOn");

  u_SpotlightOn = gl.getUniformLocation(gl.program, "u_SpotlightOn");
  u_SpotPos = gl.getUniformLocation(gl.program, "u_SpotPos");
  u_SpotDir = gl.getUniformLocation(gl.program, "u_SpotDir");
  u_SpotCutoff = gl.getUniformLocation(gl.program, "u_SpotCutoff");
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

    if (event.key.toLowerCase() === "l") {
      g_lightingOn = !g_lightingOn;
    }

    if (event.key.toLowerCase() === "n") {
      g_normalOn = !g_normalOn;
    }

    if (event.key.toLowerCase() === "o") {
      g_spotlightOn = !g_spotlightOn;
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

function setupUI() {
  const lightingButton = document.getElementById("lightingButton");
  const normalButton = document.getElementById("normalButton");
  const spotlightButton = document.getElementById("spotlightButton");

  const lightSlider = document.getElementById("lightSlider");
  const redSlider = document.getElementById("redSlider");
  const greenSlider = document.getElementById("greenSlider");
  const blueSlider = document.getElementById("blueSlider");

  if (lightingButton) {
    lightingButton.onclick = function () {
      g_lightingOn = !g_lightingOn;
    };
  }

  if (normalButton) {
    normalButton.onclick = function () {
      g_normalOn = !g_normalOn;
    };
  }

  if (spotlightButton) {
    spotlightButton.onclick = function () {
      g_spotlightOn = !g_spotlightOn;
    };
  }

  if (lightSlider) {
    lightSlider.oninput = function () {
      g_lightPos[0] = Number(this.value);
    };
  }

  if (redSlider) {
    redSlider.oninput = function () {
      g_lightColor[0] = Number(this.value) / 100;
    };
  }

  if (greenSlider) {
    greenSlider.oninput = function () {
      g_lightColor[1] = Number(this.value) / 100;
    };
  }

  if (blueSlider) {
    blueSlider.oninput = function () {
      g_lightColor[2] = Number(this.value) / 100;
    };
  }
}

function handleMovement() {
  if (keys["w"]) camera.moveForward();
  if (keys["s"]) camera.moveBackward();
  if (keys["a"]) camera.moveLeft();
  if (keys["d"]) camera.moveRight();
  if (keys["q"]) camera.panLeft();
  if (keys["e"]) camera.panRight();
}

function updateLight() {
  g_lightAngle += 0.02;

  g_lightPos[1] = 8 + Math.sin(g_lightAngle) * 3;
  g_lightPos[2] = 16 + Math.cos(g_lightAngle) * 8;

  // Spotlight follows the camera like a flashlight
  g_spotPos = [
    camera.eye.elements[0],
    camera.eye.elements[1],
    camera.eye.elements[2]
  ];

  let dir = camera.getForwardVector();
  
  if (dir) {
    g_spotDir = [
      dir.elements[0],
      dir.elements[1],
      dir.elements[2]
    ];
  }
}

function tick() {
  handleMovement();
  updateLight();

  world.checkGame(camera);
  renderScene();

  requestAnimationFrame(tick);
}

function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

  gl.uniform3f(u_LightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(
    u_CameraPos,
    camera.eye.elements[0],
    camera.eye.elements[1],
    camera.eye.elements[2]
  );

  gl.uniform3f(u_LightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
  gl.uniform1i(u_LightingOn, g_lightingOn);
  gl.uniform1i(u_NormalOn, g_normalOn);

  gl.uniform1i(u_SpotlightOn, g_spotlightOn);
  gl.uniform3f(u_SpotPos, g_spotPos[0], g_spotPos[1], g_spotPos[2]);
  gl.uniform3f(u_SpotDir, g_spotDir[0], g_spotDir[1], g_spotDir[2]);
  gl.uniform1f(u_SpotCutoff, g_spotCutoff);

  world.render();
  drawLightMarker();
}

function drawLightMarker() {
  let lightCube = new Cube();

  gl.uniform1i(u_LightingOn, false);

  lightCube.textureNum = -1;
  lightCube.color = [1, 1, 0, 1];

  lightCube.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  lightCube.matrix.scale(0.4, 0.4, 0.4);
  lightCube.matrix.translate(-0.5, -0.5, -0.5);

  lightCube.render();

  gl.uniform1i(u_LightingOn, g_lightingOn);
}

main();