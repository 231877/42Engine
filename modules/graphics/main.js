/**
 * @file Модуль для графики
 * @author wmgcat
 * @version 1.1
*/

import { Text } from './src/text.js';
import { _Image } from './src/image.js';

class Graphics {
  constructor(canvasID, smooth=false, game=false) {
    this.link = canvasID;
    this.smooth = smooth;
    this.game = game;
    this.vertexShaders = {};
    this.fragmentShaders = {};
    this.programList = {};

    this.colorLocation = false;
    this.positionBuffer = false;

    this.reset();
    this.GLprogram('default',
      this.shader('default', 'vertex', `
      attribute vec2 a_position;
      uniform mat4 u_matrix;
      void main() {
          gl_Position = u_matrix * vec4(a_position, 0, 1);
      }
    `), this.shader('default', 'fragment', `
      precision mediump float;
      uniform vec4 u_color;
      uniform float u_time;
      void main() {
          gl_FragColor = vec4(u_color.r / 255.0, u_color.g / 255.0, u_color.b / 255.0, u_color.a);
      }
    `),
    (program, gl) => {
      program.pLocation = gl.getAttribLocation(program, 'a_position');
      program.cLocation = gl.getUniformLocation(program, 'u_color');
      program.tLocation = gl.getUniformLocation(program, 'u_time');
      program.mLocation = gl.getUniformLocation(program, 'u_matrix');

      gl.uniformMatrix4fv(program.mLocation, false, [
        1, 0, 0, 0,
        0, -1, 0, 0,
        0, 0, -1, 0,
        -1, 1, 0, 1
      ]);

      gl.vertexAttribPointer(program.pLocation, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.pLocation);
    },
    (program, gl, count=0, update, params={}, fill='TRIANGLE_STRIP') => {
      gl.uniform1f(program.tLocation, params.time || (performance.now() * .001));
      gl.uniform4f(program.cLocation, ...(params.cLocation || [0, 0, 0, 1]));

      update(program, gl);

      gl.vertexAttribPointer(program.buffPosition, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl[fill], 0, count);
    });

    this.GLprogram('image',
      this.shader('image', 'vertex', `
        attribute vec2 a_position;
        attribute vec2 a_texcoord;

        uniform mat4 u_matrix;
        varying vec2 v_TexCoord;
        uniform float u_angle;
        uniform vec2 v_offset;
        uniform vec2 v_ratio;

        mat4 rotate(float angle) {
            float c = cos(angle);
            float s = sin(angle);
            return mat4(
                c, -s, 0.0, 0.0,
                s,  c, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            );
        }
        mat4 translate(vec2 pos) {
            return mat4(
                1.0, 0.0, 0.0, 0.0,
                0.0, 1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                pos.x, pos.y, 0.0, 1.0
            );
        }

        mat4 scale(float sx, float sy) {
            return mat4(
                sx, 0.0, 0.0, 0.0,
                0.0, sy, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            );
        }

        void main() {
            float aspect = v_ratio.x / v_ratio.y;
            mat4 aspectFix = scale(1.0, aspect);
            gl_Position = u_matrix * translate(v_offset) * aspectFix * rotate(u_angle) * scale(1.0, 1.0 / aspect) * translate(-v_offset) * vec4(a_position, 0, 1);
            v_TexCoord = a_texcoord;
        }
      `),
      this.shader('image', 'fragment', `
        precision mediump float;
        varying vec2 v_TexCoord;
        uniform sampler2D u_texture;
        uniform float u_alpha;

        void main() {
          vec4 color = texture2D(u_texture, v_TexCoord);
          gl_FragColor = vec4(color.rgb, color.a * u_alpha);
        }
      `),
      (program, gl) => {
        program.pLocation = gl.getAttribLocation(program, 'a_position');
        program.tcLocation = gl.getAttribLocation(program, 'a_texcoord');
        program.mLocation = gl.getUniformLocation(program, 'u_matrix');
        program.fAngle = gl.getUniformLocation(program, 'u_angle');
        program.tLocation = gl.getUniformLocation(program, 'u_texture');
        program.fAlpha = gl.getUniformLocation(program, 'u_alpha');
        program.pOffset = gl.getUniformLocation(program, 'v_offset');
        program.pRatio = gl.getUniformLocation(program, 'v_ratio');

        gl.uniformMatrix4fv(program.mLocation, false, [
          1, 0, 0, 0,
          0, -1, 0, 0,
          0, 0, -1, 0,
          -1, 1, 0, 1
        ]);
        program.texCoordBuffer = gl.createBuffer();
      },
      (program, gl, count=0, update, params={}, fill='TRIANGLE_STRIP') => {        
        update(program, gl);

        gl.vertexAttribPointer(program.buffPosition, 2, gl.FLOAT, false, 0, 0);
        gl.vertexAttribPointer(program.texCoordBuffer, 2, gl.FLOAT, false, 0, 0);

        if (params.texture) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, params.texture);
          gl.uniform1i(program.tLocation, 0);
        }
        gl.uniform1f(program.fAlpha, params.alpha);
        gl.uniform1f(program.fAngle, params.angle || 0);
        gl.uniform2f(program.pOffset, params.xoff || 0, params.yoff || 0);
        gl.uniform2f(program.pRatio, this.w, this.h);
        gl.drawArrays(gl[fill], 0, count);
      }
    );
    
    
    this.text = new Text(this);
  }

  get w() { return this.link.width; }
  get h() { return this.link.height; }

  shader(id, type, code) {
    if (!this.source) return false;

    const types = {
      'vertex': this.source.VERTEX_SHADER,
      'fragment': this.source.FRAGMENT_SHADER
    };

    const shader = this.source.createShader(types[type]);
    this.source.shaderSource(shader, code);
    this.source.compileShader(shader);

    if (this.source.getShaderParameter(shader, this.source.COMPILE_STATUS)) {
      this[`${type}Shaders`][id] = shader;
      return this[`${type}Shaders`][id];
    }

    console.error('[shader compile error]:\n', this.source.getShaderInfoLog(shader));
    this.source.deleteShader(shader);
  }

  GLprogram(id, vShader, fShader, init, update) {
    const program = this.source.createProgram();
    this.source.attachShader(program, vShader);
    this.source.attachShader(program, fShader);

    this.source.linkProgram(program);
    if (!this.source.getProgramParameter(program, this.source.LINK_STATUS)) {
      console.error('[program compile error]:\n', this.source.getProgramInfoLog(program));
      return false;
    }

    this.programList[id] = program;
    this.programList[id].init = init;
    this.programList[id].update = update;
    this.programList[id].buffPosition = this.source.createBuffer();

    return this.programList[id];
  }
  checkWebGLError() {
       const error = this.source.getError();
       if (error !== this.source.NO_ERROR) {
           console.error("WebGL Error: ", error);
       }
   }

  /**
   * Переустановка канваса
  */
  reset() {
    this.source = this.link.getContext('webgl', { alpha: false, premultipliedAlpha: true });
    if (!this.source) throw Error('webgl is not support!');

    this.source.imageSmoothingEnabled = this.smooth;
    if (this.smooth)
      this.link.imageSmoothingQuality = 'high';
    this.link.style['image-rendering'] = this.smooth ? 'smooth' : 'pixelated';
    this.link.style['font-smooth'] = this.smooth ? 'always' : 'never';
  }

  setProgram(program) {
    if (this.program == program) return;
    this.program = program;

    this.source.useProgram(this.program);
    this.program.init(this.program, this.source);
  }
  /**
   * Переводит HEX в RGB
   * 
   * @param  {string} HEX Цвет
   * @return {Array} [R, G, B]
  */
  rgb(HEX) {
    const code = `0x${HEX.substring(1)}`;
    return [(code >> 16) & 255, (code >> 8) & 255, code & 255];
  }

  /**
   * Переводит RGB в HEX
   *
   * @param {number} R Красный
   * @param {number} G Зеленый
   * @param {number} B Синий
   * @return {string} HEX
  */
  hex(r, g, b) {
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length == 1 ? `0${hex}` : hex;
    }).join('')}`;
  }

  /**
   * Рисует прямоугольник
   * 
   * @param {number} x X
   * @param {number} y Y
   * @param {number} w Ширина
   * @param {number} h Высота
   * @param {string|object} color='#000' Цвет или Текстура
   * @param {string} type='fill' Заполнение, может быть fill или stroke
  */
  rect(x, y, w, h, color='#000', type='fill', alpha=1, program=this.programList.default, params={}) {
    this.setProgram(program);
    
    const x1 = x / this.w * 2,
          y1 = y / this.h * 2,
          x2 = (x + w) / this.w * 2,
          y2 = (y + h) / this.h * 2;

    program.update(program, this.source, 4, (_program, gl) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, _program.buffPosition);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          x1, y1,
          x2, y1,
          x1, y2,
          x2, y2
        ]),
        gl.STATIC_DRAW
      );
    }, {
      cLocation: [...this.rgb(color), alpha],
      ...params
    });
  }

  /**
   * Рисует круг
   * 
   * @param {number} x X
   * @param {number} y Y
   * @param {number} range Радиус
   * @param {string|object} color='#000' Цвет или Текстура
   * @param {string} type='fill' Заполнение, может быть fill или stroke
   * @param {number} start=0 Начало круга в радианах
   * @param {number} end=Math.PI*2 Конец круга в радианах
  */
  circle(x, y, range, color='#000', type='fill', start=0, end=Math.PI*2, alpha=1, program=this.programList.default, params={}) {
    this.setProgram(program);
    const pos = [];
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * 2 * Math.PI;

      pos.push((x + Math.cos(angle) * range) / this.w * 2, (y + Math.sin(angle) * range) / this.h * 2);
    }

    program.update(program, this.source, pos.length * .5, (_program, gl) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, _program.buffPosition);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(pos),
        gl.STATIC_DRAW
      );
    }, {
      cLocation: [...this.rgb(color), alpha],
      ...params
    }, 'TRIANGLE_FAN');
  }

  /**
   * Рисует эллипс
   * 
   * @param {number} x X
   * @param {number} y Y
   * @param {number} w Ширина
   * @param {number} h Высота
   * @param {string|object} color='#000' Цвет или Текстура
   * @param {string} type='fill' Заполнение, может быть fill или stroke
  */
  ellipse(x, y, w, h, color='#000', alpha=1.0, program=this.programList.default, params={}) {
    this.setProgram(program);
    const pos = [];
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * 2 * Math.PI;

      pos.push((x + Math.cos(angle) * w) / this.w * 2, (y + Math.sin(angle) * h) / this.h * 2);
    }

    program.update(program, this.source, pos.length * .5, (_program, gl) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, _program.buffPosition);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(pos),
        gl.STATIC_DRAW
      );
    }, {
      cLocation: [...this.rgb(color), alpha],
      ...params
    }, 'TRIANGLE_FAN');
  }
}

export {
  Graphics, Text, _Image
}