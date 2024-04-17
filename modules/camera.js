export class Camera {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  view(cvs) { cvs.source.translate(-this.x, -this.y); }

  reset(cvs) { cvs.source.translate(this.x, this.y); }
}