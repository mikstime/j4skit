# j4skit


## Что такое j4skit?
Это фреймворк для разработки SPA приложений.

Основные достоинства:

- Декларативность
- Слабая связность компонент
- Гибкий навигатор, который упрощает навигацию по приложению
- Совместимость с шаболнизаторами (pug, handlebars и другие)
- Изменения не приводят к повторной отрисовке всей страницы
- 0 зависимостей

С чего начать?
```npm i j4skit```

nav.js
```ecmascript 6
import {Navigator} from 'j4skit'
// Один навигатор на приложение
Navigator = new Navigator();
export {Navigator}
```
hello.js
```ecmascript 6
import {Page} from 'j4skit'
import {Navigator} from './app.js'
//Самая простая реализация компоненты
class Component1 extends Page {
  render() {
    return 'hello, world';
  }
}
//Более сложная: при клике на надпись "Нажми на меня"
//Появляется надпись hello, world
class Component2 extends Page {
  render() {
    return `
    <h1 id="hello">Нажми на меня</h1>
    <div id="id1"></div>
    `;
  }

  componentDidMount() {
    super.componentDidMount()
    this.getContainer()
      .querySelector('#hello')
      .addEventListener('click', () => {
        // Пути будут добавлены в уже имеющийся корень.
        // Если бы он не существовал, создался бы новый
        Navigator.addRoutes([
          {
            path: '^/',
            childRoutes: [
              {
                path: 'hello',
                alwaysOn: true,
                element: CHILD_ELEMENT,
              }
            ]
           }
        ])
        // Для Component1 вызовутся методы
        // componentWillUpdate() и render()
        // При этом сама компоненты не перерисуется
        // Во избежание слишком частых обновлений,
        // Метод render должен быть чистой функцией
        Navigator.updateAllPages();
      }
    )
  }
}

// Может быть любой селектор, например #elem_id или .class_name
export const CONTAINER_1 = 'body' 
export const CONTAINER_2 = '#hello' 
// Инициализировать компоненту с привязкой к родителю по селектору
// Позволяет использовать один элемент на многих страницах
export const ROOT_ELEMENT = new Component1(CONTAINER_1);
export const CHILD_ELEMENT = new Component2(CONTAINER_2);

const Routes = [
  {
    element: ROOT_ELEMENT,
    path : '^/' // регулярное выражение
                // 'any' - всегда будет отрисован.
                // можно использовать флаг alwaysOn для такого же эффекта
                // имеется флаг exact для точного совпадения пути
  }
]

export default Routes;
```
app.js
```ecmascript 6
import { Navigator } from './nav'
import HELLO_WORLD_ROUTES from './hello.js'
// Добавить пути
Navigator.addRoutes(HELLO_WORLD_ROUTES)
// Отрисовать нужную страницу
Navigator.showPage(window.location.pathname)
```

С помощью j4skit разработана биржа вакансий hahao.ru