import { _Image as Image } from '../../../modules/graphics/main.js';

const Data = {
  image: false,
  txt: false,
  alpha: 0
}

export function draw(cvs, Game, ratio) {
  if (!Data.image) {
    Data.image = new Image(Game, require('./my.png'), 0, 0, 256, 256, 128, 256, 1);
    Data.txt = new Image(Game, require('./my_text.png'), 0, 0, 256, 192, 128, 192, 1);
    Data.image.load();
    Data.txt.load();
  }

  cvs.rect(0, 0, cvs.w, cvs.h, '#1e0528');
  cvs.text._size = ratio * .1;
  if (Data.txt) {
    cvs.source.globalAlpha = Math.min(Math.max(Math.abs(Math.sin(Game.current_time * .5)), .25), 1);
      Data.txt.draw(cvs.w * .5, cvs.h * .5, undefined, undefined, ratio * .0025, ratio * .0025);
    cvs.source.globalAlpha = 1;
  }
  if (Data.image)
    Data.image.draw(cvs.w * .5, cvs.h + ratio * (.025 + Math.abs(Math.sin(Game.current_time * .25)) * .1), undefined, undefined, ratio * .0025, ratio * .0025, Math.sin(Game.current_time * .25) * 25 / 180 * Math.PI);
}