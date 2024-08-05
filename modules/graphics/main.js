/**
 * @file Модуль для графики
 * @author wmgcat
 * @version 1.1
*/

import { Text } from './src/text.js';
import { _Image } from './src/image.js';

class Graphics {
  constructor(canvasID, smooth=false) {
    this.link = canvasID;
    this.smooth = smooth;
    this.reset();
    this.text = new Text(this);
  }

  get w() { return this.link.width; }
  get h() { return this.link.height; }

  /**
   * Переустановка канваса
  */
  reset() {
    this.source = this.link.getContext('2d');
    if (!this.source) throw Error('Ошибка при создании 2D контекста!');

    this.source.imageSmoothingEnabled = this.smooth;
    if (this.smooth)
      this.link.imageSmoothingQuality = 'high';
    this.link.style['image-rendering'] = this.smooth ? 'smooth' : 'pixelated';
    this.link.style['font-smooth'] = this.smooth ? 'always' : 'never';
    
  }

  /**
   * Переводит HEX в RGB
   * 
   * @param  {string} HEX Цвет
   * @return {Array} [R, G, B]
  */
  rgb(HEX) {
    const code = `0x${HEX.substring(1)}`;
    return [(code >> 16) & 255, (code >> 8) & 255, code & 255];
  }

  /**
   * Переводит RGB в HEX
   *
   * @param {number} R Красный
   * @param {number} G Зеленый
   * @param {number} B Синий
   * @return {string} HEX
  */
  hex(r, g, b) {
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length == 1 ? `0${hex}` : hex;
    }).join('')}`;
  }

  /**
   * Рисует прямоугольник
   * 
   * @param {number} x X
   * @param {number} y Y
   * @param {number} w Ширина
   * @param {number} h Высота
   * @param {string|object} color='#000' Цвет или Текстура
   * @param {string} type='fill' Заполнение, может быть fill или stroke
  */
  rect(x, y, w, h, color='#000', type='fill') {
    this.source[type + 'Style'] = color;
    this.source[type + 'Rect'](x, y, w, h);
  }

  /**
   * Рисует прямоугольник с закругленными краями
   * 
   * @param {number} x X
   * @param {number} y Y
   * @param {number} w Ширина
   * @param {number} h Высота
   * @param {number|Array} range Скругление краев. Можно указать каждый угол отдельно, используя массив
   * @param {string|object} color='#000' Цвет или Текстура
   * @param {string} type='fill' Заполнение, может быть fill или stroke
  */
  round(x, y, w, h, range, color='#000', type='fill') {
    this.source[type + 'Style'] = color;
    this.source.beginPath();
      if (!this.source.roundRect) this.source.rect(x, y, w, h);
      else this.source.roundRect(x, y, w, h, range);

      this.source[type]();
    this.source.closePath();
  }

  /**
   * Рисует круг
   * 
   * @param {number} x X
   * @param {number} y Y
   * @param {number} range Радиус
   * @param {string|object} color='#000' Цвет или Текстура
   * @param {string} type='fill' Заполнение, может быть fill или stroke
   * @param {number} start=0 Начало круга в радианах
   * @param {number} end=Math.PI*2 Конец круга в радианах
  */
  circle(x, y, range, color='#000', type='fill', start=0, end=Math.PI*2) {
    this.source[type + 'Style'] = color;
    this.source.beginPath();
      this.source.arc(x, y, range, start, end);
      this.source[type]();
    this.source.closePath();
  }

  /**
   * Рисует эллипс
   * 
   * @param {number} x X
   * @param {number} y Y
   * @param {number} w Ширина
   * @param {number} h Высота
   * @param {string|object} color='#000' Цвет или Текстура
   * @param {string} type='fill' Заполнение, может быть fill или stroke
  */
  ellipse(x, y, w, h, color='#000', type='fill') {
    this.source[type + 'Style'] = color;
    this.source.beginPath();
      this.source.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
      this.source[type]();
    this.source.closePath();
  }
}

export {
  Graphics, Text, _Image
}