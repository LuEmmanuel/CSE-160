class World {
  constructor() {
    this.size = 32;
    this.map = this.createWorldMap();

    // Baby pandas are placed near spawn for reliable testing/collection
    this.babyAnimals = [
    
  new Animal(5, 0.4, 5, 0.7),
  new Animal(25, 0.4, 8, 0.7),
  new Animal(20, 0.4, 25, 0.7)
    ];

    this.foundCount = 0;
  }

  createWorldMap() {
    const map = [];

    for (let z = 0; z < this.size; z++) {
      const row = [];

      for (let x = 0; x < this.size; x++) {
        // Outer border walls
        if (x === 0 || x === this.size - 1 || z === 0 || z === this.size - 1) {
          row.push(4);
        }

        // Inner maze walls
        else if ((x === 8 && z > 3 && z < 27) || (z === 16 && x > 4 && x < 28)) {
          row.push(2);
        }

        // Taller inner walls
        else if ((x === 22 && z > 5 && z < 18) || (z === 7 && x > 15 && x < 28)) {
          row.push(3);
        }

        // Small scattered blocks
        else if ((x + z) % 13 === 0) {
          row.push(1);
        }

        // Empty space
        else {
          row.push(0);
        }
      }

      map.push(row);
    }

    // Openings/pathways
    map[16][8] = 0;
    map[16][9] = 0;
    map[7][22] = 0;
    map[8][22] = 0;
    map[16][20] = 0;

    // Clear spawn area around the player
    for (let z = 21; z <= 30; z++) {
      for (let x = 13; x <= 19; x++) {
        map[z][x] = 0;
      }
    }

    // Clear space around baby pandas
   this.clearArea(map, 5, 5);
this.clearArea(map, 25, 8);
this.clearArea(map, 20, 25);

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
    this.drawMainAnimal();
    this.drawBabyAnimals();
  }

  drawGround() {
    let ground = new Cube();

    // Texture 0 = grass
    ground.textureNum = 0;
    ground.color = [1, 1, 1, 1];

    ground.matrix.translate(16, -0.05, 16);
    ground.matrix.scale(32, 0.1, 32);
    ground.matrix.translate(-0.5, 0, -0.5);

    ground.render();
  }

  drawSky() {
    let sky = new Cube();

    // Solid color sky so color + texture both exist in the project
    sky.textureNum = -1;
    sky.color = [0.45, 0.7, 1.0, 1];

    sky.matrix.translate(16, 16, 16);
    sky.matrix.scale(200, 200, 200);
    sky.matrix.translate(-0.5, -0.5, -0.5);

    // Prevent sky cube from covering the rest of the scene
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
            wall.textureNum = 3; // dirt
          } else if (height === 2) {
            wall.textureNum = 1; // wall
          } else {
            wall.textureNum = 2; // stone
          }

          wall.matrix.translate(x, y, z);
          wall.render();
        }
      }
    }
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
    let mainPanda = new Animal(15, 1, 13, 1.2);
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

   // console.log("Trying to remove block at:", pos.x, pos.z);

    if (this.inBounds(pos.x, pos.z)) {
     // console.log("Current height:", this.map[pos.z][pos.x]);

      if (this.map[pos.z][pos.x] > 0) {
        this.map[pos.z][pos.x]--;
     //   console.log("Removed block");
      } else {
      //  console.log("No block there");
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

