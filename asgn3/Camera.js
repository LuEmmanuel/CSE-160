class Camera {
  constructor(canvas) {
    this.fov = 60;

    this.eye = new Vector3([16, 2, 28]);
    this.at = new Vector3([16, 2, 27]);
    this.up = new Vector3([0, 1, 0]);

    this.speed = 0.25;

    this.yaw = 180;   // left/right rotation
    this.pitch = 0;   // up/down rotation

    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();

    this.projectionMatrix.setPerspective(
      this.fov,
      canvas.width / canvas.height,
      0.1,
      1000
    );

    this.updateViewMatrix();
  }

  updateAt() {
    let yawRad = (this.yaw * Math.PI) / 180;
    let pitchRad = (this.pitch * Math.PI) / 180;

    let forwardX = Math.sin(yawRad) * Math.cos(pitchRad);
    let forwardY = Math.sin(pitchRad);
    let forwardZ = Math.cos(yawRad) * Math.cos(pitchRad);

    this.at.elements[0] = this.eye.elements[0] + forwardX;
    this.at.elements[1] = this.eye.elements[1] + forwardY;
    this.at.elements[2] = this.eye.elements[2] + forwardZ;
  }

  updateViewMatrix() {
    this.updateAt();

    this.viewMatrix.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0], this.at.elements[1], this.at.elements[2],
      this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );
  }

  moveForward() {
    let yawRad = (this.yaw * Math.PI) / 180;

    this.eye.elements[0] += Math.sin(yawRad) * this.speed;
    this.eye.elements[2] += Math.cos(yawRad) * this.speed;

    this.updateViewMatrix();
  }

  moveBackward() {
    let yawRad = (this.yaw * Math.PI) / 180;

    this.eye.elements[0] -= Math.sin(yawRad) * this.speed;
    this.eye.elements[2] -= Math.cos(yawRad) * this.speed;

    this.updateViewMatrix();
  }

  moveLeft() {
  let yawRad = ((this.yaw + 90) * Math.PI) / 180;

  this.eye.elements[0] += Math.sin(yawRad) * this.speed;
  this.eye.elements[2] += Math.cos(yawRad) * this.speed;

  this.updateViewMatrix();
}

moveRight() {
  let yawRad = ((this.yaw - 90) * Math.PI) / 180;

  this.eye.elements[0] += Math.sin(yawRad) * this.speed;
  this.eye.elements[2] += Math.cos(yawRad) * this.speed;

  this.updateViewMatrix();
}

  panLeft() {
    this.yaw += 2;
    this.updateViewMatrix();
  }

  panRight() {
    this.yaw -= 2;
    this.updateViewMatrix();
  }

  mousePan(deltaX, deltaY) {
    if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) return;

    this.yaw -= deltaX * 0.05;
    this.pitch -= deltaY * 0.05;

    // prevent flipping upside down
    if (this.pitch > 60) this.pitch = 60;
    if (this.pitch < -60) this.pitch = -60;

    this.updateViewMatrix();
  }

  getMapPositionInFront() {
    let yawRad = (this.yaw * Math.PI) / 180;

let targetX = this.eye.elements[0] + Math.sin(yawRad) * 4;
let targetZ = this.eye.elements[2] + Math.cos(yawRad) * 4;

    return {
      x: Math.floor(targetX),
      z: Math.floor(targetZ)
    };
  }
}