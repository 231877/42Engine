/**
 * @file Модуль изображений
 * @author wmgcat
 * @version 1.2
*/

export class _Image {
  constructor(game, path, left, top, w, h, xoff, yoff, frames, speed=1) {
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
    this.current_frame = 0;
  }

  async load() {
    const img = new Image();
    img.src = this.path;
    return new Promise((res, rej) => {
      img.onload = () => {
        this.source = img;
        this.loaded = true;
        res(true);
      }
      img.onerror = err => rej(err);
    });
  }

  get frame() {
    return this.left + this.w * ~~this.current_frame;
  }

  getLeft() { return this.frame % this.source.width; }
  getTop() { return this.top + ~~(this.frame / this.source.width) * this.h; }
  getXoff(w, xscale=1) { return (w / this.w * this.xoff) * xscale; }
  getYoff(h, yscale=1) { return (h / this.h * this.yoff) * yscale; }

  draw(x, y, w=this.w, h=this.h, xscale=1, yscale=1, rotate=0) {
    if (!this.loaded) return;
    
    const cvs = this.game.graphics.source,
          left = this.frame % this.source.width,
          top = this.top + ~~(this.frame / this.source.width) * this.h,
          xoff = (w / this.w * this.xoff) * xscale, yoff = (h / this.h * this.yoff) * yscale;
    
    let xx = x - xoff,
        yy = y - yoff;

    if (rotate) {
      cvs.translate(x, y);
      cvs.rotate(rotate);
      xx = -xoff;
      yy = -yoff;
    }

    cvs.drawImage(
      this.source,
      left, top,
      this.w, this.h,
      xx, yy,
      w * xscale, h * yscale
    );

    if (rotate) {
      cvs.rotate(-rotate);
      cvs.translate(-x, -y);
    }

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