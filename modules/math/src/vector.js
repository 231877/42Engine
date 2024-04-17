import { math } from './math.js';


export const vector = {};

vector.add = (a, b) => new Vector(a.x + b.x, a.y + b.y);
vector.sub = (a, b) => new Vector(a.x - b.x, a.y - b.y);

vector.dist = (a, b) => math.distance(a.x, a.y, b.x, b.y);

export class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  mag(x) {
    const mag = Math.sqrt(this.x * this.x + this.y * this.y);
    this.x *= x / mag;
    this.y *= x / mag;
  }

  add(b) {
    this.x += b.x;
    this.y += b.y;
  }

  invert() {
    return new Vector(-this.x, -this.y);
  }

  copy() {
    return new Vector(this.x, this.y);
  }
}