/**
 * @file Модуль для математических операций и столкновений
 * @author wmgcat
 * @version 1.2
*/

export const math = {};

/**
 * Дистанция от A до B
 *
 * @param {number} x1 a.x
 * @param {number} y1 a.y
 * @param {number} x2 b.x
 * @param {number} y2 b.y
 * return {number}
*/
math.distance = (x1, y1, x2, y2) => Math.sqrt(((y2 - y1) ** 2) + ((x2 - x1) ** 2));

/**
 * Угол от A до B
 *
 * @param {number} x1 a.x
 * @param {number} y1 a.y
 * @param {number} x2 b.x
 * @param {number} y2 b.y
 * return {number} в радианах
*/
math.direction = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);

/**
 * Выводит дистанцию и угол от A до B
 *
 * @param {number} x1 a.x
 * @param {number} y1 a.y
 * @param {number} x2 b.x
 * @param {number} y2 b.y
 * return {object}
*/
math.distdir = (x1, y1, x2, y2) => ({
  distance: math.distance(x1, y1, x2, y2),
  direction: math.distance(x1, y1, x2, y2)
});

/**
 * Выводит [-1, 0, 1] в зависимости от значения X
 * 
 * @param  {number} x X
 * @return {number}
 */
math.sign = x => Math.sign(x);

/**
 * Интерполяция
 *
 * @param {number} a A
 * @param {number} b B
 * @param {number} step шаг интерполяции
 * @return {number}
*/
math.lerp = (a, b, step) => a + step * (b - a);

/**
 * Ограничение x по min и max
 * 
 * @param {number} x X
 * @param {number} min минимальное значение
 * @param {number} max максимальное значение
 * @return {number}
*/
math.clamp = (x, min, max) => Math.min(Math.max(x, min), max);

/**
 * Переводит число в радианы
 *
 * @param {number} x Число
 * @return {number}
*/
math.torad = x => x * Math.PI / 180;

/**
 * Переводит радианы в число
 *
 * @param {number} x Радианы
 * @return {number}
*/
math.todeg = x => x / Math.PI * 180;

/**
 * Проверка столкновений
 * @type {Object}
*/
math.collision = {};

/**
 * Проверяет есть ли точка на прямоугольнике
 * 
 * @param  {number} px X точки
 * @param  {number} py Y точки
 * @param  {number} x X
 * @param  {number} y Y
 * @param  {number} w Ширина
 * @param  {number} [h=w] Высота
 * @return {bool}
 */
math.collision.rect = (px, py, x, y, w, h) => (
  (px >= x && py >= y) && (px <= x + w && py <= y + (h || w))
);

/**
 * Проверяет есть ли точка в окружности
 *
 * @param {number} px X точки
 * @param {number} py Y точки
 * @param {number} x X
 * @param {number} y Y
 * @param {number} range Радиус
 *
 * @return {bool}
*/
math.collision.circle = (px, py, x, y, range) => (math.distance(px, py, x, y) <= range);

/**
 * Проверка столкновений с мышкой
 * @type {Object}
*/
math.collision.mouse = {};

/**
 * Проверка столкновений мышки с прямоугольником
 * 
 * @param  {number} x X
 * @param  {number} y Y
 * @param  {number} w Ширина
 * @param  {number} [h=w] Высота
 * @return {bool}
 */
math.collision.mouse.rect = (x, y, w, h) => math.collision.rect(mouse.x, mouse.y, x, y, w, (h || w));

/**
 * Проверка столкновений мышки с прямоугольником, относительно камеры
 * 
 * @param  {number} x X
 * @param  {number} y Y
 * @param  {number} w Ширина
 * @param  {number} [h=w] Высота
 * @return {bool}
*/
math.collision.mouse.grect = (x, y, w, h) => math.collision.rect(
  mouse.x - cameraes[current_camera].x, mouse.y - cameraes[current_camera].y,
  x, y,
  w, h || w
);

/**
 * Проверка столкновений мышки с окружностью
 * 
 * @param  {number} x X
 * @param  {number} y Y
 * @param  {number} range Радиус
 * @return {bool}
*/
math.collision.mouse.circle = (x, y, range) => math.collision.circle(mouse.x, mouse.y, x, y, range);


/**
 * Проверка столкновений мышки с окружностью, относительно камеры
 * 
 * @param  {number} x X
 * @param  {number} y Y
 * @param  {number} range Радиус
 * @return {bool}
*/
math.collision.mouse.gcircle = (x, y, range) => math.collision.circle(
  mouse.display_x, mouse.display_y,
  x, y,
  range
);