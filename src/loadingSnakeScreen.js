import { _Image as Image } from '../modules/graphics/main.js';
import { Ease, math } from '../modules/math/main.js';

let logo = false, alpha = 0, coin = false, boot = false, dir = 0, pulse = 0;
export function draw(cvs, Game, ratio) {
  cvs.rect(0, 0, cvs.w, cvs.h, '#acc656');
  if (!logo) {
    logo = new Image(Game, require('../../bricks/src/png/loading.png'), 0, 0, 128, 128, 64, 64, 6, 5);
    logo.load();
    coin = new Image(Game, require('../../bricks/src/png/coin.png'), 0, 0, 64, 64, 32, 32, 1, 0);
    coin.load();
    boot = new Image(Game, require('../../bricks/src/png/boot.png'), 0, 0, 256, 256, 128, 10, 1, 0);
    boot.load();
  } else {
    cvs.source.globalAlpha = alpha;
      const lsize = ratio * .4 * Ease.OutBack(alpha);
      logo.draw(cvs.w * (.5 + pulse * .75), cvs.h * (.5 - .3 * pulse), lsize, lsize);
    
    if (alpha < 1)
      alpha = Math.min(1, alpha + Game.deltatime * .5);
    else {
      if (!Game._isLoad) {
        const count = 5, size = ratio * .01, offset = ratio * .05,
              x = (cvs.w - (size + offset) * (count - 1)) * .5,
              y = cvs.h * .5 + ratio * .2 + size;
        for (let i = 0; i < count; i++) {
          cvs.source.globalAlpha = Ease.InOutCirc(1 - ((((count - i) + Game.current_time) * .1) % 1));
          coin.draw(x + (size + offset) * i, y + Ease.InQuint(Math.abs(Math.sin(Game.current_time * .25 + i))) * size, size * 5, size * 5);
          //cvs.circle(x + (size + offset) * i, y + Ease.InQuint(Math.abs(Math.sin(Game.current_time * .25 + i))) * size, size, '#fff');
        }
      } else {
        const bootscale = ratio * .0035;
        const bootdir = math.clamp(dir, 0, 90);
        if (dir < 1) {
          dir = Math.min(1, dir + Game.deltatime * 5);
        } else {
          if (pulse < 1)
            pulse = Math.min(1, pulse + Game.deltatime * 5);
          else Game.loaded = true;
        }
        boot.draw(0, 0, undefined, undefined, bootscale, bootscale, -bootdir);
      }
    }
    cvs.source.globalAlpha = 1;
  }
}