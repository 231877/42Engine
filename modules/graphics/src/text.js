import { Graphics } from '../main.js';
import { _Image as Image } from './image.js';

const ALIGN = {
  'left-top': ['left', 'top'],
  'left-bottom': ['left', 'bottom'],
  'left-middle': ['left', 'middle'],
  'center-top': ['center', 'top'],
  'center-bottom': ['center', 'bottom'],
  'center-middle': ['center', 'middle'],
  'right-top': ['right', 'top'],
  'right-bottom': ['right', 'bottom'],
  'right-middle': ['right', 'middle'],
  'lt': ['left', 'top'],
  'lb': ['left', 'bottom'],
  'lm': ['left', 'middle'],
  'ct': ['center', 'top'],
  'cb': ['center', 'bottom'],
  'cm': ['center', 'middle'],
  'rt': ['right', 'top'],
  'rb': ['right', 'bottom'],
  'rm': ['right', 'middle']
}


export class Text {
  constructor(graphics, font='Arial', size=10) {
    this.graphics = graphics;
    if (!(this.graphics instanceof Graphics))
      throw Error('Не найден класс Graphics!');
    this._font = font;
    this._size = size;
    this.type = ' ';

    this.cache = {};
  }

  get source() {
    return this.graphics.source;
  }

  get font() {
    return `${this.type}${this._size}px ${this._font}`;
  }

  /**
   * Разделяет текст на строки
   * 
   * @param  {string} str Текст
   * @param  {number} w Максимальная ширина строки
   * @return {array}
  */
  parse(str, w) {
    const lines = [], parseText = str.split(' ');
    let offset = 0;

    this.source.font = this.font;
    for (let i = 0; i < parseText.length; i++) {
      const line = parseText.slice(offset, i).join(' ');
      if (this.width(line) >= w) {
        lines.push(line);
        offset = i;
      }
    }
    lines.push(parseText.slice(offset).join(' '));
    return lines;
  }

  /**
   * Возвращает длину текста
   *
   * @param {string|array} str текст
   * @return {number}
  */
  width(str) {
    this.source.font = this.font;
    if (typeof(str) == 'string')
      return str.length * this._size;
      //return this.source.measureText(str).width;
    
    return str.map(line => this.width(line)).sort((a, b) => b - a)[0];
  }

  /**
   * Рисует текст
   * 
   * @param {string} str Текст
   * @param {number} x X
   * @param {number} y Y
   * @param {string|object} [color=#000] Цвет или Текстура
   * @param {string} [type=fill] Заполнение, может быть fill или stroke
   * @param {string} [align=lt] Положение текста
  */
  async draw(str, x, y, color='#000', type='fill', align='lt', program=this.graphics.programList.image, params={}) {
    const id = `${str}_${align}`
    if (!this.cache[id] || this.cache[id][1] != this._size || this.cache[id][2] != color) {
      const cid = document.createElement('canvas');
      cid.height = this._size;
      let cvs = cid.getContext('2d');
      cvs.font = this.font;
      cid.width = cvs.measureText(str).width;
      cvs = cid.getContext('2d');
      cvs.font = this.font;
      [cvs.textAlign, cvs.textBaseline] = ALIGN[align];
      cvs[type + 'Style'] = color;

      let left = (cvs.textAlign == 'center') ? (cid.width * .5) : (cvs.textAlign == 'left' ? 0 : cid.width),
          top = (cvs.textBaseline == 'middle') ? (cid.height * .5) : (cvs.textBaseline == 'top' ? 0 : cid.height);
      cvs[type + 'Text'](str, left, top);

      this.cache[id] = [new Image(this.graphics.game, cid.toDataURL('image/png'), 0, 0, cid.width, cid.height, left, top, 1), this._size, color];
      await this.cache[id][0].load();
    }

    this.cache[id][0].draw(x, y, undefined, undefined, undefined, undefined, undefined, undefined, program, params);
  }

  /**
   * Рисует текст с обводкой
   * 
   * @param {string|array} str Текст
   * @param {number} x X
   * @param {number} y Y
   * @param {string} [color=#fff] Цвет текста
   * @param {string} [linecolor=#000] Цвет обводки
   * @param {string} [align=lt] Положение текста
   * @return {object} Возвращает объект с методами: one - для обычного текста, multi - для переноса строки
  */
  outline(str, x, y, color='#fff', linecolor='#000', align='lt') {
    this.source.lineWidth = this._size * .05;

    return {
      one: () => {
        this.draw(str, x, y, color, 'fill', align);
        this.draw(str, x, y, linecolor, 'stroke', align);
      },
      multi: () => {
        this.drawMultiLine(str, x, y, color, 'fill', align);
        this.drawMultiLine(str, x, y, linecolor, 'stroke', align);
      }
    }
  }

  /**
   * Рисует текст с переносом строки
   * 
   * @param {array} str Текст
   * @param {number} x X
   * @param {number} y Y
   * @param {string|object} [color=#000] Цвет или Текстура
   * @param {string} [type=fill] Заполнение, может быть fill или stroke
   * @param {string} [align=left-top] Положение текста
  */
  drawMultiLine(str, x, y, color='#000', type='fill', align='lt', program=this.graphics.programList.image, params={}) {
    const [ textAling, textBaseline ] = ALIGN[align];
    if (textBaseline == 'bottom') y = y - (str.length - 1) * this._size;
    if (textBaseline == 'middle') y = y - (str.length - 1) * this._size * .5;
    for (let i = 0; i < str.length; i++)
      this.draw(str[i], x, y + this._size * i, color, type, align, program, params);    
  }

  /**
   * Добавляет шрифт
   * 
   * @param  {string} path Путь к файлу
   * @param  {string} name Название шрифта
  */
  async add(path, name) {
    this.graphics.link.loading++;
    const font = new FontFace(name, `url(${path})`);
    document.fonts.add(font);
    
    let state = await font.load();
    this.graphics.link._loading++;
  }
}