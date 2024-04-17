/**
 * @file Модуль псевдо-генерации
 * @author wmgcat
 * @version 1.0
*/

export const random = {};

Object.defineProperty(random, 'seed', {
  
  /**
   * Установка сида для псевдо-генерации
   * 
   * @param {number|string} seed Значение псевдо-генератора
   * @return {number}
  */
  set: function(seed) {
    if (typeof(seed) == 'string') {
      let _seed = '';
      for (let i = 0; i < seed.length; i++)
        _seed += seed.charCodeAt(i);

      this._seed = (_seed - 0) % 32000;
      //Add.debug('Установлен random.seed:', _seed);
      return this._seed;
    }
    this._seed = seed;
    //Add.debug('Установлен random.seed:', seed);
    return this._seed;
  }
});

random.seed = Date.now();

/**
 * Выдает псевдо-случайное число
 *
 * @return {number} Число от 0 до 1
*/
random.rand = function() {
  let numb = Math.sin(this._seed++) * 1000;
  return Math.min(Math.max(numb - ~~numb, 0), 1);
}


