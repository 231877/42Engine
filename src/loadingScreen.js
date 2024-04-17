import { _Image as Image } from '../modules/graphics/main.js';
import { Ease } from '../modules/math/main.js';

let logo = false, alpha = 0;
export function draw(cvs, Game, ratio) {
  cvs.rect(0, 0, cvs.w, cvs.h, '#000');
  if (!logo) {
    logo = new Image(Game, require('./logo.svg'), 0, 0, 512, 512, 256, 256, 1);
    logo.load();
  } else {
    cvs.source.globalAlpha = alpha;
      const lsize = ratio * .4 * Ease.OutBack(alpha);
      logo.draw(cvs.w * .5, cvs.h * .5, lsize, lsize);
    
    if (alpha < 1)
      alpha = Math.min(1, alpha + Game.deltatime * .5);
    else {
      const count = 5, size = ratio * .01, offset = ratio * .05,
            x = (cvs.w - (size + offset) * (count - 1)) * .5,
            y = cvs.h * .5 + ratio * .2 + size;
      for (let i = 0; i < count; i++) {
        cvs.source.globalAlpha = Ease.InOutCirc(1 - ((((count - i) + Game.current_time) * .1) % 1));
        cvs.circle(x + (size + offset) * i, y + Ease.InQuint(Math.abs(Math.sin(Game.current_time * .25 + i))) * size, size, '#fff');
      }
    }
    cvs.source.globalAlpha = 1;
  }
}