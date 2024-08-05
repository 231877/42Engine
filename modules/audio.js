/**
 * @file Модуль аудио
 * @author wmgcat
 * @version 1.1
*/

export const audio = {}

audio.stack = {};
audio.listener = [];
audio.volumes = {};


const MAX_LISTENER = 25;


const windowAudioContext = window.AudioContext || window.webkitAudioContext || false;
audio.context = windowAudioContext ? (new windowAudioContext) : false;

// отключение методов навигатора:
if ('mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', () => { });
  navigator.mediaSession.setActionHandler('pause', () => { });
  navigator.mediaSession.setActionHandler('seekbackward', () => { });
  navigator.mediaSession.setActionHandler('seekforward', () => { });
  navigator.mediaSession.setActionHandler('previoustrack', () => { });
  navigator.mediaSession.setActionHandler('nexttrack', () => { });
}

// перезагрузка аудио при переключении вкладок:
if (audio.context)
  audio.context.onstatechange = () => {
    if (audio.context.state != 'interrupted') return;
    audio.context.resume();
  }

/**
 * Проигрывает звук/музыку
 * 
 * @param  {string} id Аудио
 * @param  {bool} [loop=false] Зацикливание
*/
audio.play = function(id, loop=false, track=false) {
  if (!this.context || !this.stack[id]) return;
  
  this.stack[id].play(loop, track);
}

/**
 * Изменяет громкость дорожки, если ее нет - создает новую
 * 
 * @param  {string} id Название дорожки
 * @param  {number} [value=1] Громкость (0..1)
*/
audio.volume = function(id, value=1) {
  if (!this.context) return;

  if (!(id in this.volumes)) {
    this.volumes[id] = this.context.createGain();
    this.volumes[id].save = value;
  }
  this.volumes[id].gain.value = value;
}

/**
 * Останавливает проигрывание звука/музыки
 * 
 * @param  {string} id Аудио
*/
audio.stop = function(id) {
  if (!this.stack[id] || !this.context) return;

  this.stack[id].stop();
}

/**
 * Класс звука
 * @constructor
*/
class Sound {
  /**
   * @param  {object} buffer Аудио буффер
   * @param  {string} track Звуковая дорожка
  */
  constructor(buffer, track) {
    this.buffer = buffer;
    this.track = track;
    this.index = -1;
  }

  /**
   * Проигрывание звука/музыки
   * 
   * @param  {bool} loop Зацикливание
  */
  play(loop, volume=false) {
    if (audio.listener.length > MAX_LISTENER) return;

    audio.listener.push(audio.context.createBufferSource());
    
    this.index = audio.listener[audio.listener.length - 1];
    this.index.buffer = this.buffer;
    this.index.connect(audio.volumes[volume || this.track]).connect(audio.context.destination);
    if (this.index.start) this.index.start(audio.context.currentTime);

    this.index.onended = () => this.stop();
    this.index.loop = loop;
  }

  /**
   * Останавливает звук
  */
  stop() {
    if (this.index == -1) return;

    if (this.index.stop) this.index.stop();
    
    let index = audio.listener.indexOf(this.index);
    if (~index)
      audio.listener = audio.listener.splice(index, 1);
    this.index = -1;
  }
}

/**
 * Добавление звуков и установка их дорожки
 * 
 * @param  {Game} game Объект игры
 * @param {string} path Путь до файла
 * @param {string} [type=sounds] Тип аудиофайла
*/
export async function add(game, path, type='sounds') {
  

  const req = new XMLHttpRequest();
  req.open('GET', path, true);
  req.responseType = 'arraybuffer';
  return new Promise((res, rej) => {

    req.onload = () => {
      audio.context.decodeAudioData(req.response, buffer => {
        if (!audio.stack) return;

        let npath = path.split('/');
        if (npath[0] == '.') npath = npath.splice(1, npath.length - 1);
        if (npath[0] == 'data') npath = npath.splice(1, npath.length - 1);
        for (const ext of ['.wav', '.ogg', '.mp3'])
          npath[npath.length - 1] = npath[npath.length - 1].replace(ext, '');
        npath = npath.join('.');
        audio.stack[npath] = new Sound(buffer, type);
        res(true);
      });
    }
    req.onerror = err => { rej(err); }
    req.send();
  });
}

/**
 * Добавление звука с помощью require
 *
 * @param  {Game} game Объект игры
 * @param {string} path Путь до файла
 * @param {string} [type=sounds] Тип аудиофайла
 * @param {string} id ID звука
*/
export async function addPath(game, path, type, id) {
  const req = new XMLHttpRequest();
  req.open('GET', path, true);
  req.responseType = 'arraybuffer';
  return new Promise((res, rej) => {

    req.onload = () => {
      audio.context.decodeAudioData(req.response, buffer => {
        if (!audio.stack) return;

        audio.stack[id] = new Sound(buffer, type);
        res(true);
      });
    }
    req.onerror = err => { rej(err); }
    req.send();
  });
}