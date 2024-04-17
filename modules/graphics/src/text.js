import { Graphics } from '../main.js';


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
      return this.source.measureText(str).width;
    
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
  draw(str, x, y, color='#000', type='fill', align='lt') {
    this.source.font = this.font;
    [this.source.textAlign, this.source.textBaseline] = ALIGN[align];
    this.source[type + 'Style'] = color;
    this.source[type + 'Text'](str, x, y);
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
  drawMultiLine(str, x, y, color='#000', type='fill', align='lt') {
    if (typeof(str) != 'object') return;
    this.source.font = this.font;
    [this.source.textAlign, this.source.textBaseline] = ALIGN[align];
    this.source[type + 'Style'] = color;

    if (this.source.textBaseline == 'bottom') y = y - (str.length - 1) * this._size;
    if (this.source.textBaseline == 'middle') y = y - (str.length - 1) * this._size * .5;
    for (let i = 0; i < str.length; i++)
      this.source[type + 'Text'](str[i], x, y + this._size * i);
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