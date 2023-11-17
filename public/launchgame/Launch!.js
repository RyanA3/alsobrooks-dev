var mat4;

const vertShader = `

attribute vec4 aPos;
attribute vec3 aColor;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * aPos;
}

`;

const fragShader = `


void main() {
    gl_FragColor = vec4(1);
}

`;

main();

function imports() {
  var lmat4;
  import("../modules/gl-matrix").then((mat4) => {
    lmat4 = mat4;
  });
  mat4 = lmat4;
}

function main() {
  imports();

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
  gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 6, 0);
  gl.enableVertexAttribArray(posLoc);
  //const colorLoc = gl.getAttribLocation(shader, "aColor");
  //gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 6, 3);
  //gl.enableVertexAttribArray(colorLoc);

  //Initialize rendering settings
  gl.clearColor(0, 0, 0, 1);
  gl.clearDepth(1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  //Initialize camera
  const projLoc = gl.getUniformLocation(shader, "projectionMatrix");
  const modelViewLoc = gl.getUniformLocation(shader, "modelViewMatrix");
  setCam(gl, 45, 0, 0, 0, projLoc, modelViewLoc);

  //Render
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
  gl.uniformMatrix4fv(modelViewLoc, false, modelViewLoc);
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
