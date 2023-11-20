import * as vec3 from "../modules/esm/vec3.js";
import * as mat4 from "../modules/esm/mat4.js";

import { Camera } from "./camera.js";
const vertShader = `
#version 100

attribute vec3 aPos;
attribute vec3 aColor;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;
varying vec3 oColor;

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(aPos, 1);
    oColor = aColor;
}

`;

const fragShader = `
#version 100

precision highp float;
varying vec3 oColor;

void main() {
    gl_FragColor = vec4(oColor, 1.0);
}

`;

main();

async function main() {
  const canvas = document.querySelector("#launchCanvas");
  const gl = canvas.getContext("webgl2");

  if (gl === null) {
    alert(
      "Error initializing OpenGL, your browser or hardware might not support it!"
    );
    return;
  }

  //Create shader program
  const shader = initShaderProgram(gl, vertShader, fragShader);

  //Create VBO
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  const vertices = [
    -0.5, -0.5, -1.0, 1, 0, 0, 0, 0.5, -1.0, 0, 1, 0, 0.5, -0.5, -1.0, 0, 0, 1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  //Configure the vertex attribute for position
  const posLoc = gl.getAttribLocation(shader, "aPos");
  gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 6 * 4, 0);
  gl.enableVertexAttribArray(posLoc);
  const colorLoc = gl.getAttribLocation(shader, "aColor");
  gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 6 * 4, 3 * 4);
  gl.enableVertexAttribArray(colorLoc);

  //Rendering setup
  gl.useProgram(shader);

  //Initialize rendering settings
  gl.clearColor(0, 0, 0, 1);
  gl.clearDepth(1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  //Initialize camera
  const projLoc = gl.getUniformLocation(shader, "projectionMatrix");
  const viewLoc = gl.getUniformLocation(shader, "viewMatrix");
  const modelLoc = gl.getUniformLocation(shader, "modelMatrix");
  var pos = vec3.fromValues(0.0, 0.0, 0.0);
  var forward = vec3.fromValues(0.0, 0.0, -1.0);
  vec3.normalize(forward, forward);
  var up = vec3.fromValues(0.0, 1.0, 0.0);
  const cam = new Camera(gl, projLoc, viewLoc, 90, pos, forward, up);

  const modelMatrix = mat4.create();
  gl.uniformMatrix4fv(modelLoc, false, modelMatrix);

  var r = 0.0;
  while (true) {
    r++;

    //Render
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    pos = vec3.fromValues(0.0, 0.0, Math.sin(r / 100.0) + 0.51);
    cam.setPosition(pos);
    cam.upload();

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);

    await sleep(20);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//Loads a vertex and fragment shader, compiles and links them
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  //Check link status
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert(`Failed to link shader program: ${gl.getProgramInfoLog(program)}`);
    return null;
  }

  return program;
}

//Loads and compiles a shader from source
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  //Check compilation status
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred while compiling a shader: ${gl.getShaderInfoLog(
        shader
      )}`
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
