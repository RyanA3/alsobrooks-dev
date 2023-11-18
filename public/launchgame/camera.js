import * as mat4 from "../modules/esm/mat4.js";

export class Camera {
  constructor(gl, projectionMatrixLoc, modelViewMatrixLoc, fov, x, y, z) {
    this.gl = gl;

    //For uniforms
    this.projectionMatrixLoc = projectionMatrixLoc;
    this.modelViewMatrixLoc = modelViewMatrixLoc;

    //For position
    this.x = x;
    this.y = y;
    this.z = z;
    this.updateModelViewMatrix();

    //For perspective
    this.fov = (fov * Math.PI) / 180; //Convert to radians
    this.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    this.zNear = 0.1;
    this.zFar = 100.0;
    this.updateProjectionMatrix();

    this.upload();
  }

  setPosition(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.updateModelViewMatrix();
  }

  //Regenerates projection matrix
  updateProjectionMatrix() {
    this.projectionMatrix = mat4.create();
    mat4.perspective(
      this.projectionMatrix,
      this.fov,
      this.aspect,
      this.zNear,
      this.zFar
    );
  }

  //Regenerates model view matrix
  updateModelViewMatrix() {
    this.modelViewMatrix = mat4.create();
    mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [
      this.x,
      this.y,
      this.z,
    ]);
  }

  //Uploads matrix data to gpu (updates the uniforms)
  upload() {
    this.gl.uniformMatrix4fv(
      this.projectionMatrixLoc,
      false,
      this.projectionMatrix
    );
    this.gl.uniformMatrix4fv(
      this.modelViewMatrixLoc,
      false,
      this.modelViewMatrix
    );
  }
}
