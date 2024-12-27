/**
 * @file Основной функционал движка
 * @author wmgcat
*/

import { Byte } from './modules/byte.js';
import { Graphics } from './modules/graphics/main.js';
import * as LoadingScreen from './src/loadingScreen.js';
import * as SiteLock from './src/sitelock/main.js';

export class Game {
  constructor(id, params={}) {
    if (SiteLock.check(params.blacklist))
      params.locked = true;

    this.config = {
      title: params.title || '42eng', author: params.author || 'wmgcat',
      debug: params.debug || false,
      build: {
        v: '1.9',
        href: 'https://github.com/wmgcat/42eng'
      },
      window: {
        id: id,
        percent: params.percent || 1,
        hideCursor: params.hideCursor || false,
        nopixel: params.pixel || false,
        hdrmax: params.hdrmax || 2
      },
      smooth: params.smooth || false,
      locked: params.locked,
      redirect: params.redirect,
      happytimer: params.happytimer || 15,
      multitab: params.multitab || false
    }

    this.current_time = 0;
    this.delta = Date.now();
    this.deltatime = 0;
    this.pause = false;
    this.focus = false;
    this.resized = false;
    this.canvasID = document.getElementById(id);
    this.loaded = false;
    this.ratio = 0;
    
    this.ignoreKeyboard = false;
    this.ignoreMouse = params.ignoreMouse || false;

    this.mouse = {
      x: 0, y: 0,
      event: new Byte('uclick', 'dclick', 'hover', 'wheelup', 'wheeldown')
    }

    if (this.config.multitab && typeof(BroadcastChannel) != 'undefined') {
      this.multitab = new BroadcastChannel(`${this.config.title}-multitab`);
      this.multitab.postMessage('new');
      this.multitab.onmessage = _ => { this.event('newtab'); }
    }


    if (!this.canvasID) throw Error(`Канвас ${id} не найден!`);

    // стили:
    this.style();
    
    window.onload = () => {
      this.resize();
      this.graphics = new Graphics(this.canvasID, this.config.smooth, this);
    }
    this.resize();
    this.graphics = new Graphics(this.canvasID, this.config.smooth, this);

    this.events = [];
    this.listenEvents();
    this.canvasID.focus();
  }

  /** Выводит информацию о проекте */
  info() {
    console.info(`Движок: 42eng (v${this.config.build.v})\n${this.config.build.href}`);
  }

  style() {
    const all = document.querySelectorAll('html, body, canvas');
    for (const elem of all) {
      elem.style.cssText = "\
        margin: 0;\
        padding: 0;\
      ";
      switch(elem.tagName) {
        case 'BODY':
          elem.style.cssText += "\
            background: #1e0528;\
            overflow: hidden;\
            -webkit-touch-callout:none;\
            -webkit-user-select:none;\
            -khtml-user-select:none;\
            -moz-user-select:none;\
            -ms-user-select:none;\
            user-select:none;\
            -webkit-tap-highlight-color:rgba(0,0,0,0);\
            touch-action: manipulation;\
          ";
        break;
          case 'CANVAS':
            elem.style.cssText += "\
              -webkit-touch-callout:none;\
              -webkit-user-select:none;\
              -khtml-user-select:none;\
              -moz-user-select:none;\
              -ms-user-select:none;\
              user-select:none;\
              -webkit-tap-highlight-color:rgba(0,0,0,0);\
              touch-action: manipulation;\
              position: absolute;\
              image-rendering: optimizeSpeed;\
              z-index: 5;\
              top: 0;\
              left: 0;\
              border: none;\
              outline: none;\
            ";
        break;
      }
    }
  }

  resize() {
    this.resized = true;
    const pixel = this.config.window.nopixel ? 1 : (Math.min(this.config.window.hdrmax, window.devicePixelRatio) || 1);
    
    this.canvasID.style.width = `${window.innerWidth}px`;
    this.canvasID.style.height = `${window.innerHeight}px`;
    
    this.canvasID.width = window.innerWidth * this.config.window.percent * pixel;
    this.canvasID.height = window.innerHeight * this.config.window.percent * pixel;
    
    if (this.graphics)
      this.graphics.reset();
  }

  addEvent(control) {
    this.events.push(control);
    this.listenEvents();
  }

  event(type, ...params) {
    console.log(type, params);
  }

  listenEvents() {
    window.onkeyup = window.onkeydown = e => {
      if (this.ignoreKeyboard) return;
      if (e.type == 'keyup')
        this.event('anykey');
      for (const control of this.events)
        if (!control.event(e))
          return;

      e.preventDefault();
      e.stopImmediatePropagation();
    }
    window.onresize = () => {
      this.resize();
      this.graphics.reset();
      this.event('resize');
    }
    
    const getMousePosition = event => {
      const pixel = this.config.window.nopixel ? 1 : (Math.min(this.config.window.hdrmax, window.devicePixelRatio) || 1);
      const rect = this.canvasID.getBoundingClientRect();
      this.mouse.x = event.clientX * this.config.window.percent * pixel - rect.left;
      this.mouse.y = event.clientY * this.config.window.percent * pixel - rect.top;
    }, getTouchPosition = event => {
      const pixel = this.config.window.nopixel ? 1 : (Math.min(this.config.window.hdrmax, window.devicePixelRatio) || 1);
      const rect = this.canvasID.getBoundingClientRect();
      this.mouse.x = event.changedTouches[0].clientX * this.config.window.percent * pixel - rect.left;
      this.mouse.y = event.changedTouches[0].clientY * this.config.window.percent * pixel - rect.top;
    }

    window.onmouseup = window.onmousedown = window.ontouchstart = window.ontouchend = e => {
      if (this.ignoreMouse) return;
      this.event('focus');
      if (e.type == 'touchstart' || e.type == 'touchend') {
        this.mouse.isTouch = true;
        getTouchPosition(e);
        this.mouse.event.add((e.type == 'touchend') ? 'uclick' : 'dclick');
      } else {
        if (e.button == 0) {
          this.mouse.isTouch = false;
          getMousePosition(e);
          this.mouse.event.add((e.type == 'mouseup') ? 'uclick' : 'dclick');
        }
      }
      if (e.type == 'touchend' || e.type == 'mouseup')
        this.event('anykey');
      e.preventDefault();
      e.stopImmediatePropagation();
    }
    
    window.onmousemove = window.ontouchmove = e => {
      if (this.ignoreMouse) return;
      if (e.type == 'mousemove') {
        getMousePosition(e);
        this.mouse.isTouch = false;
      } else {
        getTouchPosition(e);
        this.mouse.isTouch = true;
      }
    }

    this.canvasID.onwheel = e => {
      if (this.ignoreMouse) return;
      e.preventDefault();
    }
    this.canvasID.oncontextmenu = e => {
      if (this.ignoreMouse) return;
      e.preventDefault();
    }

    window.onfocus = () => { this.event('focus'); }
    window.onblur = () => { this.event('blur'); }
  }

  update(draw) {
    
   
    

    const _update = () => {
      const timenow = performance.now();
      this.deltatime = Math.min((timenow - this.delta) * .001, .05);
      this.delta = timenow;

      if (this.graphics) {
        this.graphics.source.viewport(0, 0, this.graphics.w, this.graphics.h);
        this.graphics.source.clearColor(0.11, 0.01, 0.15, 1.0);
        this.graphics.source.clear(this.graphics.source.COLOR_BUFFER_BIT);
        this.graphics.source.enable(this.graphics.source.BLEND);
        this.graphics.source.blendFunc(this.graphics.source.SRC_ALPHA, this.graphics.source.ONE_MINUS_SRC_ALPHA);


        

        

        if (this.resized) {
          this.ratio = Math.min(this.graphics.w, this.graphics.h);
          this.resized = false;
        }



        if (!this.loaded) LoadingScreen.draw(this.graphics, this, this.ratio);
        else draw(this.deltatime, this.graphics, this.ratio);
        
        if (this.config.locked) {
          if (!this.config.lockedTimer) {
            this.config.lockedTimer = new SiteLock.Timer(this.config.happytimer);
          } else {
            if (this.config.lockedTimer.check()) {
              SiteLock.draw(this.graphics, this, this.ratio);
              if (this.config.redirect) {
                const a = document.createElement('a');
                a.href = this.config.redirect;
                a.target = '_blank';
                a.style.position = 'fixed';
                a.style.top = '0';
                a.style.left = '0';
                a.style.width = '100vw';
                a.style.height = '100vh';
                a.style.zIndex = '100';
                document.body.appendChild(a);

                delete this.config.redirect;
              }
            }
          }
        }
      }

      //this.delta = timenow;
      this.current_time = (this.current_time + this.deltatime * 4) % 1000;

      if (!this.config.window.hideCursor)
        this.canvasID.style.cursor = this.mouse.event.check('hover') ? 'pointer' : 'default';
      else this.canvasID.style.cursor = 'none';
      if (this.mouse.event.key)
        this.mouse.event.clear('uclick', 'hover', 'dclick');
      this.graphics.source.enableVertexAttribArray(this.graphics.positionLocation);
      this.requestAnimationFrame(_update);
    }
    _update();
  }

  requestAnimationFrame(func) {
    (window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame || window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame || function(res) {
      window.setTimeout(res, 1000 / 60);
    })(func);
  }
}