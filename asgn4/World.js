class World {
  constructor() {
    this.size = 32;
    this.map = this.createWorldMap();

    this.babyAnimals = [
      new Animal(5, 0.4, 5, 0.7),
      new Animal(25, 0.4, 8, 0.7),
      new Animal(20, 0.4, 25, 0.7)
    ];

    this.foundCount = 0;

    // OBJ model
    this.homer = new Model("models/homer.obj");
  }

  createWorldMap() {
    const map = [];

    for (let z = 0; z < this.size; z++) {
      const row = [];

      for (let x = 0; x < this.size; x++) {
        if (x === 0 || x === this.size - 1 || z === 0 || z === this.size - 1) {
          row.push(4);
        } else if ((x === 8 && z > 3 && z < 27) || (z === 16 && x > 4 && x < 28)) {
          row.push(2);
        } else if ((x === 22 && z > 5 && z < 18) || (z === 7 && x > 15 && x < 28)) {
          row.push(3);
        } else if ((x + z) % 13 === 0) {
          row.push(1);
        } else {
          row.push(0);
        }
      }

      map.push(row);
    }

    map[16][8] = 0;
    map[16][9] = 0;
    map[7][22] = 0;
    map[8][22] = 0;
    map[16][20] = 0;

    for (let z = 21; z <= 30; z++) {
      for (let x = 13; x <= 19; x++) {
        map[z][x] = 0;
      }
    }

    this.clearArea(map, 5, 5);
    this.clearArea(map, 25, 8);
    this.clearArea(map, 20, 25);

    this.clearArea(map, 12, 12);
    this.clearArea(map, 26, 24);

    // Clear space around Homer
    this.clearArea(map, 18, 18);

    return map;
  }

  clearArea(map, centerX, centerZ) {
    for (let z = centerZ - 1; z <= centerZ + 1; z++) {
      for (let x = centerX - 1; x <= centerX + 1; x++) {
        if (x > 0 && x < this.size - 1 && z > 0 && z < this.size - 1) {
          map[z][x] = 0;
        }
      }
    }
  }

  render() {
    this.drawSky();
    this.drawGround();
    this.drawWalls();
    this.drawSun();
    this.drawSpheres();
    this.drawHomer();
    this.drawMainAnimal();
    this.drawBabyAnimals();
  }

  drawGround() {
    let ground = new Cube();

    ground.textureNum = 0;
    ground.color = [1, 1, 1, 1];

    ground.matrix.translate(16, -0.05, 16);
    ground.matrix.scale(32, 0.1, 32);
    ground.matrix.translate(-0.5, 0, -0.5);

    ground.render();
  }

  drawSky() {
    let sky = new Cube();

    sky.textureNum = -1;
    sky.color = [0.45, 0.7, 1.0, 1];

    sky.matrix.translate(16, 16, 16);
    sky.matrix.scale(200, 200, 200);
    sky.matrix.translate(-0.5, -0.5, -0.5);

    gl.depthMask(false);
    sky.render();
    gl.depthMask(true);
  }

  drawWalls() {
    for (let z = 0; z < this.size; z++) {
      for (let x = 0; x < this.size; x++) {
        const height = this.map[z][x];

        for (let y = 0; y < height; y++) {
          let wall = new Cube();

          wall.color = [1, 1, 1, 1];

          if (height === 1) {
            wall.textureNum = 3;
          } else if (height === 2) {
            wall.textureNum = 1;
          } else {
            wall.textureNum = 2;
          }

          wall.matrix.translate(x, y, z);
          wall.render();
        }
      }
    }
  }

  drawSpheres() {
    let sphere1 = new Sphere(24);
    sphere1.textureNum = -1;
    sphere1.color = [1.0, 0.2, 0.2, 1];
    sphere1.matrix.translate(12, 1.2, 12);
    sphere1.matrix.scale(1.2, 1.2, 1.2);
    sphere1.render();

    let sphere2 = new Sphere(24);
    sphere2.textureNum = -1;
    sphere2.color = [0.2, 0.4, 1.0, 1];
    sphere2.matrix.translate(26, 1.0, 24);
    sphere2.matrix.scale(1.0, 1.0, 1.0);
    sphere2.render();
  }

  drawHomer() {
    if (!this.homer) return;

    this.homer.matrix = new Matrix4();

    this.homer.textureNum = -1;
    this.homer.color = [1.0, 0.85, 0.25, 1];

    this.homer.matrix.translate(18, -0.6, 18);
    this.homer.matrix.scale(4, 4, 4);
    this.homer.matrix.rotate(360, 0, 1, 0);

    this.homer.render();
  }

  drawSun() {
    let sun = new Cube();

    sun.textureNum = -1;
    sun.color = [1.0, 0.85, 0.1, 1];

    sun.matrix.translate(5, 20, 5);
    sun.matrix.scale(3, 3, 3);

    sun.render();
  }

  drawMainAnimal() {
    let mainPanda = new Animal(15, 0.4, 13, 1.2);
    mainPanda.render();
  }

  drawBabyAnimals() {
    for (let animal of this.babyAnimals) {
      animal.render();
    }
  }

  checkGame(camera) {
    for (let animal of this.babyAnimals) {
      if (animal.checkFound(camera)) {
        this.foundCount++;

        const scoreElement = document.getElementById("score");

        if (this.foundCount < 3) {
          scoreElement.innerText =
            "Baby pandas found: " + this.foundCount + " / 3";
        } else {
          scoreElement.innerHTML =
            `
            You found all 3 baby pandas!<br>
            The village is saved!<br><br>
            Press P to play again
            `;
        }
      }
    }
  }

  addBlock(camera) {
    const pos = camera.getMapPositionInFront();

    if (this.inBounds(pos.x, pos.z)) {
      if (this.map[pos.z][pos.x] < 4) {
        this.map[pos.z][pos.x]++;
      }
    }
  }

  removeBlock(camera) {
    const pos = camera.getMapPositionInFront();

    if (this.inBounds(pos.x, pos.z)) {
      if (this.map[pos.z][pos.x] > 0) {
        this.map[pos.z][pos.x]--;
      }
    }
  }

  inBounds(x, z) {
    return x >= 0 && x < this.size && z >= 0 && z < this.size;
  }

  restartGame() {
    this.foundCount = 0;

    this.babyAnimals = [
      new Animal(5, 0.4, 5, 0.7),
      new Animal(25, 0.4, 8, 0.7),
      new Animal(20, 0.4, 25, 0.7)
    ];

    document.getElementById("score").innerText =
      "Baby pandas found: 0 / 3";
  }
}