/**
 * @file Модуль проверки значений
 * @author wmgcat
 * @version 1.2
*/

const ERRORNOKEY = 3; // Добавляет ошибку неизвестного ключа

/**
 * Проверка значений
 * 
 * @constructor
*/
export class Byte {
  /**
   * @param  {string} key Ключ, можно указать несколько
  */
  constructor(...args) {
    this.keys = {};
    this.key = 0;
    
    let offset = 0;
    for (const key of args) {
      if (!(key in this.keys))
        this.keys[key] = !offset + (2 << (offset - 1));
      offset++;
    }
  }

  /**
   * Добавляет ключ в значение
   * 
   * @param {string} key Ключ, можно указать несколько
  */
  add(...args) {
    return this.checkKey(key => {
      this.key |= this.keys[key];
    }, ...args);
  }

  /**
   * Очищает ключ из значения
   * 
   * @param {string} key Ключ, можно указать несколько
  */
  clear(...args) {
    if (!args.length) this.key = 0;
    return this.checkKey(key => {
      this.key &=~ this.keys[key];
    }, ...args);
  }

  /**
   * Проверяет ключи в значении
   *
   * @param {string} key Ключ, можно указать несколько
  */
  check(...args) {
    return this.checkKey(key => {
      if ((this.key & this.keys[key]) <= 0) return -1;
    }, ...args);
  }

  /**
   * Проверяет есть ли ключ и выполняет функцию
   * 
   * @param  {function} func(key) Функция, принимает аргумент с ключом
   * @param  {...string} key Ключ, можно указать несколько
   * @return {bool}
  */
  checkKey(func, ...args) {
    try {
      for (const key of args) {
        if (!(key in this.keys)) throw new Error(key);

        if (func(key) == -1) return false;
      }
      return true;
    } catch(err) { return Add.error(err, ERRORNOKEY); }
  }

  /** 
    * Добавление нового ключа:
    *
    * @param {...string} args Новые ключи
  */
  addKey(...args) {
    let offset = Object.keys(this.keys).length;
    for (const key of args) {
      this.keys[key] = !offset + (2 << (offset - 1));
      offset++;
    }
  }
}