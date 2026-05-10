I am building a WebGL CSE 160 Assignment 3 project using plain JavaScript and Matsuda-style WebGL utilities.

Please help me implement a first-person 32x32x4 voxel world made of textured cubes.

Rubric requirements:
- Ground made from a flattened cube or large plane.
- Sky made from a huge blue cube centered around the world.
- Walls made from cubes.
- Wall heights come from a hardcoded 32x32 JavaScript 2D array.
- Each map value is 0, 1, 2, 3, or 4 and represents the wall height at that x/z location.
- Texture works on at least one object.
- Some objects use texture, some use solid color.
- Multiple textures should work.
- Perspective camera using projection, view, and model matrices.
- Camera movement:
  W = forward
  A = left
  S = backward
  D = right
  Q = pan left
  E = pan right
- Mouse movement rotates the camera.
- Add/delete blocks in front of the camera.
- Add my animal model somewhere in the world.
- Add a simple story/game element.
- Maintain decent performance with a full 32x32 world.

Please structure the project cleanly with:
- Camera.js for camera movement and view/projection matrices.
- Cube.js for textured/color cube rendering.
- World.js for the map array, drawing ground, sky, and voxel walls.
- main.js for WebGL setup, shaders, texture loading, keyboard/mouse input, animation loop, and rendering.

Use WebGL 1.0, not Three.js.

Important:
- Use u_ModelMatrix, u_ViewMatrix, and u_ProjectionMatrix in the vertex shader.
- Use a_Position and a_UV attributes.
- Use u_BaseColor, u_WhichTexture, and samplers for multiple textures in the fragment shader.
- Let u_WhichTexture = -1 mean solid color.
- Let u_WhichTexture = 0, 1, 2, etc. choose different textures.
- Avoid creating lots of new objects inside the render loop.
- Keep the code simple and readable for a beginner WebGL class.

First, generate the complete working version of the project. Then explain briefly where each rubric point is satisfied.