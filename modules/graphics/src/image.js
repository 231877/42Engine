/**
 * @file Модуль изображений
 * @author wmgcat
 * @version 1.2
*/

export class _Image {
  constructor(game, path, left, top, w, h, xoff, yoff, frames, speed=1, offset=0) {
    this.game = game;
    this.path = path;
    
    this.left = left || 0;
    this.top = top || 0;
    this.w = w;
    this.h = h;
    this.xoff = xoff;
    this.yoff = yoff;
    this.frames = frames;
    this.speed = speed;
    this.offset = offset;
    this.current_frame = 0;
  }

  async load() {
    const img = new Image();
    img.src = this.path;
    return new Promise((res, rej) => {
      img.onload = () => {
        this.source = img;
        this.loaded = true;

        if (typeof(this.w) == 'undefined')
          this.w = this.source.width;
        if (typeof(this.h) == 'undefined')
          this.h = this.source.height;
        if (typeof(this.xoff) == 'undefined')
          this.xoff = 0;
        if (typeof(this.yoff) == 'undefined')
          this.yoff = 0;

        this.texture = this.game.graphics.source.createTexture();
        this.game.graphics.source.bindTexture(this.game.graphics.source.TEXTURE_2D, this.texture);

        this.game.graphics.source.texImage2D(this.game.graphics.source.TEXTURE_2D, 0, this.game.graphics.source.RGBA, this.game.graphics.source.RGBA, this.game.graphics.source.UNSIGNED_BYTE, this.source);
        this.game.graphics.source.generateMipmap(this.game.graphics.source.TEXTURE_2D);

        this.game.graphics.source.texParameteri(this.game.graphics.source.TEXTURE_2D, this.game.graphics.source.TEXTURE_MIN_FILTER, this.game.graphics.source.NEAREST);
        this.game.graphics.source.texParameteri(this.game.graphics.source.TEXTURE_2D, this.game.graphics.source.TEXTURE_MAG_FILTER, this.game.graphics.source.NEAREST);
        this.game.graphics.source.texParameteri(this.game.graphics.source.TEXTURE_2D, this.game.graphics.source.TEXTURE_WRAP_S, this.game.graphics.source.CLAMP_TO_EDGE);
        this.game.graphics.source.texParameteri(this.game.graphics.source.TEXTURE_2D, this.game.graphics.source.TEXTURE_WRAP_T, this.game.graphics.source.CLAMP_TO_EDGE);

        this.game.graphics.source.texImage2D(
          this.game.graphics.source.TEXTURE_2D,
          0,
          this.game.graphics.source.RGBA,
          this.game.graphics.source.RGBA,
          this.game.graphics.source.UNSIGNED_BYTE,
          this.source
        );


        res(true);
      }
      img.onerror = err => rej(err);
    });
  }

  get frame() {
    return this.left + this.w * ~~this.current_frame;
  }

  getLeft() { return (this.frame % this.source.width) + this.offset * ~~this.current_frame; }
  getTop() { return this.top + ~~(this.frame / this.source.width) * this.h + this.offset * ~~(this.frame / this.source.width); }
  getXoff(w, xscale=1) { return (w / this.w * this.xoff) * xscale; }
  getYoff(h, yscale=1) { return (h / this.h * this.yoff) * yscale; }

  getPattern() {
    const canvas = document.createElement('canvas');
    canvas.width = this.w;
    canvas.height = this.h;

    const cvs = canvas.getContext('2d');
    cvs.fillStyle = '#000';
    cvs.fillRect(0, 0, this.w, this.h);
    cvs.drawImage(
      this.source,
      this.left, this.top,
      this.w, this.h,
      0, 0,
      this.w, this.h
    );
    return canvas;
  }

  draw(x, y, w=this.w, h=this.h, xscale=1, yscale=1, rotate=0, alpha=1, program=this.game.graphics.programList.image, params={}) {
    if (!this.loaded) return;

    this.game.graphics.setProgram(program);

    const xoff = this.getXoff(w, xscale),
          yoff = this.getYoff(h, yscale),
          left = this.getLeft(),
          top = this.getTop(),

          rw = this.game.graphics.w,
          rh = this.game.graphics.h;

    const x1 = ((x - xoff) / rw) * 2,
          y1 = ((y - yoff) / rh) * 2,
          x2 = ((x - xoff + w * xscale) / rw) * 2,
          y2 = ((y - yoff + h * yscale) / rh) * 2;
    
    program.update(program, this.game.graphics.source, 4, (_program, gl) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, _program.texCoordBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          left / this.source.width, top / this.source.height,
          (left + this.w) / this.source.width, top / this.source.height,
          left / this.source.width, (top + this.h) / this.source.height,
          (left + this.w) / this.source.width, (top + this.h) / this.source.height
        ]),
        gl.STATIC_DRAW
      );
      gl.vertexAttribPointer(program.tcLocation, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(_program.pLocation);

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
      gl.vertexAttribPointer(program.pLocation, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(_program.tcLocation);
    }, {
      texture: this.texture,
      ...params,
      alpha: alpha,
      angle: rotate,
      xoff: x1 + xoff / rw * 2,
      yoff: y1 + yoff / rh * 2
    });
    
    if (this.frames > 1 && this.speed)
      this.current_frame = (this.current_frame + this.speed * this.game.deltatime) % this.frames;
  }

  copy() {
    return Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this
    );
  }
}