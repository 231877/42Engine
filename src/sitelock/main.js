import { draw } from './src/my.js';
import { Timer } from '../../modules/timer.js';

function check(sites=[]) {
  if (!~sites.indexOf(window.location.hostname)) return false;
  return true;
}

export {
  check, draw, Timer
}