export function draw(cvs, Game, ratio) {
  cvs.rect(0, 0, cvs.w, cvs.h, '#000');
  cvs.text._size = ratio * .1;
  cvs.text.type = 'bold ';
  cvs.text.draw('SiteLock active!', cvs.w * .5, cvs.h * .5, '#f00', 'fill', 'cm');
}