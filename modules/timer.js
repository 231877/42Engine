/**
 * @file Модуль таймеров
 * @author wmgcat
 * @version 2.0
*/

/**
 * Класс для таймеров
 * 
 * @contructor 
*/
export class Timer {
  /**
   * @param  {number} x Кол-во секунд, минут, часов
   * @param  {number} [multi=1000] Счетчик, по умолчанию установлен на секунды
  */
  constructor(x, multi=1000) {
    this.point = 0;
    this._max = x * multi;
    this.save_max = x;
    this.isPause = false;
    this.multi = multi;
    this.reset();
  }

  set max(x) {
    this._max = x * this.multi;
  }

  /**
   * Возвращает true если счетчик выполнился
   * 
   * @param  {bool} [loop=false] Сбрасывает счетчик по истечению времени
   * @return {bool}
  */
  check(loop=false) {
    if (this.isPause) return false;
    if ((this.point - Date.now()) > 0) return false;

    if (loop) this.reset();
    return true;
  }

  /**
   * Возвращает значение счетчика от 0 до 1
   * 
   * @return {number}
  */
  delta() {
    if (this.isPause)
      return Math.min(Math.max(this.save_point / this._max, 0), 1);
    return Math.min(Math.max(Math.max(this.point - Date.now(), 0) / this._max, 0), 1);
  }
  
  /**
   * Возвращает кол-во прохождения счетчика по таймру с момента запуска
   * 
   * @return {number}
  */
  count() {
    return ~~(Math.abs(this.point - Date.now()) / this._max);
  }

  /**
   * Сбрасывает счетчик, если указан X, то ставит значение счетчика на X
   * 
   * @param  {number} [x=0] Значение счетчика
  */
  reset(x=0) {
    if (!x) this.point = Date.now() + this._max;
    else this.point = x;
  }

  /**
   * Ставит таймер на паузу
  */
  pause() {
    this.isPause = true;
    this.save_point = this.point - Date.now();
  }

  /**
   * Восстанавливает таймер
  */
  resume() {
    this.isPause = false;
    this.point = Date.now() + this.save_point;
    delete this.save_point;
  }
}