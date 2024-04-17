# Документация по 42eng
Путеводитель для тех, кто хочет разобраться в данном движке и начать делать свои проекты. Содержание справочника может не иметь всей информации в момент своего выхода, так как с каждым обновлением у движка появляется новый функционал или упраздняется старый. Данная документация сделана и актуальна под версию движка: __v1.8__
## Содержание
* Установка
	* Hello world
	* Сборка проекта
	* Тестирование
* Модули
	* Графика
		* Примитивные фигуры
		* Изображения
		* Текст
	* Математика
		* Стандартные функции
		* Функции плавности
		* Векторы
	* Локализация
	* Таймеры
	* Битовые функции
	* Аудио
* Дополнительно
	* Конфигурация
	* Загрузочный экран
	* Примеры
		* Загрузка файлов в проект
		* Простое управление
		* Игра 2048
# Установка
## Hello world
В основном файле проекта необходимо подключить движок, все модули и скрипты подключаются через стандартные import/export в Javascript.
```js
	import * as Eng from './путь/к/папке/движка/eng.js';
```
Когда движок подключен к нашему проекту, можно написать свою первую программу! Важно. чтобы в вашем index.html был канвас с id (Например id: game)
```js
	const Game = new Eng.Game('game', {
		// конфигурация проекта, для hello world не требуется
	});

	Game.loaded = true; // Сообщаем игре, что она загружена!
	Game.update(function(dt, cvs, ratio) {
		cvs.rect(0, 0, cvs.w, cvs.h, '#fff');
		cvs.text.draw('Hello world', cvs.w * .5, cvs.h * .5, '#000', 'fill', 'center-middle');
	});
```
Подробнее узнать о конфигурации проекта можно в разделе __Дополнительно - Конфигурация__
## Сборка проекта
Для минимальной сборки проекта, на примере webpack, вам потребуется npm и 5 пакетов: webpack, html-webpack-plugin, babel-loader, url-loader и webpack-dev-server, конфиг webpack.config.js:
```js
const webpack = require('webpack'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      path = require('path');

module.exports = {
  entry: './main.js', // Основной файл
  output: {
    path: path.resolve(__dirname, 'dist'), // Папка готового билда
    filename: 'main.bundle.js' // Итоговый файл
  },
  devServer: {
    static: { directory: path.join(__dirname, 'dist') },
    compress: false,
    https: true,
    port: 8080, // Порт сервера
    client: {
      overlay: false, // Отображение ошибок на экране
      reconnect: 3 // Кол-во переподключений
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        loader: 'babel-loader'
      },
      {
        test: /\.(png|jpg|svg|mp3)$/i,
        use: [
          {
            loader: 'url-loader',
            options: { esModule: false }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      meta: { viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no' },
      minify: {
        collapseWhitespace: false,
        keepClosingSlash: false,
        removeComments: false,
        removeRedundantAttributes: false,
        removeScriptTypeAttributes: false,
        removeStyleLinkTypeAttributes: false,
        useShortDoctype: false
      }
    })
  ]
}
```
## Тестирование
В package.json добавьте в scripts две команды: dev (Для тестирования игры на локальном хостинге) и build (Сборки проекта для продакшена)
```js
"dev": "webpack-dev-server --mode=development --progress",
"build": "webpack --mode=production -w"
```
Запустите проект командой: npm run dev