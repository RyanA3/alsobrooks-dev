import * as mat4 from "../modules/esm/mat4.js";
import * as vec3 from "../modules/esm/vec3.js";

export class Camera {
  /**
   * Creates a new camera object
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLUniformLocation} projectionMatrixLoc
   * @param {WebGLUniformLocation} viewMatrixLoc
   * @param {Number} fov
   * @param {vec3} pos
   * @param {vec3} forward
   * @param {vec3} up
   */
  constructor(gl, projectionMatrixLoc, viewMatrixLoc, fov, pos, forward, up) {
    this.gl = gl;

    //For uniforms
    this.projectionMatrixLoc = projectionMatrixLoc;
    this.viewMatrixLoc = viewMatrixLoc;

    //For position
    this.pos = pos;
    this.forward = forward;
    this.up = up;
    this.updateViewMatrix();

    //For perspective
    this.fov = (fov * Math.PI) / 180; //Convert to radians
    this.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    this.zNear = 0.1;
    this.zFar = 100.0;
    this.updateProjectionMatrix();

    this.upload();
  }

  /**
   * @param {vec3} pos
   */
  setPosition(pos) {
    this.pos = pos;
    this.updateViewMatrix();
  }

  /**
   * @param {vec3} target
   */
  setTarget(target) {
    this.forward = target;
    this.updateViewMatrix();
  }

  /**
   * @param {vec3} up
   */
  setUp(up) {
    this.up = up;
    this.updateViewMatrix();
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
  updateViewMatrix() {
    this.viewMatrix = mat4.create();
    var target = vec3.create();
    vec3.add(target, this.pos, this.forward);
    mat4.lookAt(this.viewMatrix, this.pos, target, this.up);
  }

  //Uploads matrix data to gpu (updates the uniforms)
  upload() {
    this.gl.uniformMatrix4fv(
      this.projectionMatrixLoc,
      false,
      this.projectionMatrix
    );
    this.gl.uniformMatrix4fv(this.viewMatrixLoc, false, this.viewMatrix);
  }
}
