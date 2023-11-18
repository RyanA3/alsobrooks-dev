import * as mat4 from "../modules/esm/mat4.js";
const vertShader = `
#version 100

attribute vec3 aPos;
attribute vec3 aColor;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec3 oColor;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(aPos, 1);
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
    -0.25, -0.25, -1.0, 1, 0, 0, 0, 0.25, -1.0, 0, 1, 0, 0.25, -0.25, -1.0, 0,
    0, 1,
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
  const modelViewLoc = gl.getUniformLocation(shader, "modelViewMatrix");
  setCam(gl, 45, 0, 0, 0, projLoc, modelViewLoc);

  var r = 0.0;
  while (true) {
    r++;

    //Render
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    setCam(gl, 45, 0, 0, Math.sin(r / 100.0) - 1, projLoc, modelViewLoc);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);

    await sleep(20);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setCam(gl, fov, tx, ty, tz, projLoc, modelViewLoc) {
  //Generate projection matrix
  const fieldOfView = (fov * Math.PI) / 180;
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  //Generate modelview matrix
  const modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [tx, ty, tz]);

  //Update uniforms
  gl.uniformMatrix4fv(projLoc, false, projectionMatrix);
  gl.uniformMatrix4fv(modelViewLoc, false, modelViewMatrix);
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
