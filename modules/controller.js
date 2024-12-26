import { Byte } from './byte.js';

export class Controller {
  constructor(game, rule, type='keydown') {
    this.rule = rule;
    const arr = [];
    for (const code in this.rule)
      arr.push(this.rule[code]);
    this.key = new Byte(...arr);
    game.addEvent(this);
    this.game = game;
    this.type = type;
  }

  event(e) {
    if (!this.key) return false;

    const code = e.code.toLowerCase().replace('key', '');
    if (code == 'escape') {
      //this.game.event('pause');
      //return false;
    }
    if (code in this.rule)
      this.key[e.type == this.type ? 'add' : 'clear'](this.rule[code]);
    
    return true;
  }
}