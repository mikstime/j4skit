const {uuid} = require('./utils');
const {isDomElement, isBody, isString, hasId} = require('./utils/validators');

const isEqual = (o1, o2) => {
  if (typeof o1 === 'string' || typeof o1 === 'function' ||
    typeof o1 === 'number' || o1 === null || o1 === undefined) {
    return o1 === o2;
  }
  if (typeof o2 === 'string' || typeof o2 === 'function' ||
    typeof o2 === 'number' || o2 === null || o2 === undefined) {
    return o2 === o1;
  }
  if (o1 instanceof Array) {
    return o1.toString() === o2.toString();
  }
  if (o1 === o2) {
    return true;
  }
  if (!isEqual(Object.keys(o1), Object.keys(o2))) {
    return false;
  }
  for (const o of Object.keys(o1)) {
    if (!isEqual(o1[o], o2[o])) {
      return false;
    }
  }
  return true;
};

/**
 * Page - класс от которого наследуются страницы
 * описывает общие методы и реализует метод создания в DOM бокса под страницу
 * наверное можно заменить на миксин createDomBox
 */
class Page {
  static isPageComponent = true;
  // #dom;
  #pageId;
  #container;
  #prevRender;
  #prevProps;
  #prevContainerDom;
  props = {};
  
  get version() {
    return '1.0.0';
  }
  
  /**
   * default event to overwrite
   */
  componentDidMount() {}
  /**
   * default event to overwrite
   */
  componentWillMount() {}
  /**
   * default event to overwrite
   */
  componentWillUpdate() {}
  /**
   * Конструктор рендерит страницу
   * @param {HTMLAnchorElement|string} container - контейнер,
   * в который будет помещена страница
   */
  constructor(container) {
    // selector is id or 'body'
    const selector = isString(container) ? container :
      isDomElement(container) ?
        hasId(container) ? container.id :
          isBody(container) ? 'body' : null : null;
    // get dom or use provided one
    const dom = isString(container) ? document.querySelector(container) :
      isDomElement(container) ? container : null;
    if (!selector) {
      throw new Error(`
            Expected id or DOM element with id or body as container.
            Received ${container}`,
      );
    }
    this.#prevContainerDom = null;
    this.#prevProps = null;
    this.#container = {selector, dom};
    this.#pageId = uuid(); // to identify page
    // this.dom = this._createDomBox(this.#pageId); // to store children
    // this.dom.id = this.#pageId;
  }
  
  /**
   * returns container selector
   * @return {string}
   */
  get container() {
    return this.#container.selector;
  }
  
  /**
   * check if component is hidden
   * @return {boolean}
   */
  isHidden() {
    return this.#container?.dom?.hidden || !this.#container?.dom?.innerHTML;
  }
  
  /**
   * Спрятать страницу
   */
  hidePage() {
    this.dom.style.display = 'none';
    this.dom.innerHTML = '';
    this.dom.hidden = true;
  }
  
  /**
   * Создать блок страницы и поместить его в контейнер
   * @param {string} domName - имя-класс создаваемого блока
   * @return {HTMLDivElement}
   */
  _createDomBox(domName) {
    if (!this.dom) {
      this.dom = document.createElement('div');
      this.dom.id = domName; // @TODO should replace with id?
      // все страницы по умолчанию скрыты
      this.dom.hidden = true;
      // this.#container.dom.appendChild(this.dom);
    }
    return this.dom;
  }
  
  /**
   * Возвращает строку с содержимым страницы.
   * @WARNING не использовать напрямую. Использовать requestRender
   * @return {string}
   */
  render() {
    throw new Error(`
        Method render must be overwritten!
        `);
    return '';
  };
  
  /**
   * Показать страницу
   */
  showPage(force) {
    this.#container.dom = document.querySelector(this.#container.selector);
    if (!this.#container.dom) {
      throw new Error(`
          Unable to find dom with selector ${this.#container.selector}
          `);
    }
    this.componentWillUpdate && this.componentWillUpdate();
    const toShow = this.render();
    
    if (!toShow && toShow !== '' ) {
      console.error(`
              Render function must return string.
              Setting innerHTML is not supported anymore!`);
    }
    
    if (force || this.#prevRender !== toShow ||
      this.#prevContainerDom !== this.#container.dom ||
      !isEqual(this.#prevProps, this.props)||
      this.#container.dom.currentChild !== this) {
      this.#container.dom.currentChild = this;
      this.componentWillMount && this.componentWillMount();
      
      this.#container.dom.hidden = false;
      this.#container.dom.style.display = '';
      this.#container.dom.innerHTML = toShow;
      
      this.#prevRender = toShow;
      this.#prevContainerDom = this.#container.dom;
      this.#prevProps = {...this.props};
      
      this.componentDidMount && this.componentDidMount();
    }
  }
  
  /**
   * Отрисовывает страницу, вызывает события (если имеются)
   * componentWillMount и componentDidMount
   */
  requestRender(force) {
    if (typeof this.render !== 'function') {
      throw new Error(`
            Method render is reserved by Page Component and
            must be overwritten by function with return
            value of type string!`);
    }
    
    this.showPage(force);
  }
}

module.exports = {
  Page,
}