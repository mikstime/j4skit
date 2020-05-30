/**
 * Navigator
 * Осуществляет переключение между страницами
 * На вход получает объект routes,
 * в котором ключем является data-page элемента,
 * @param{Object} route
 * @return {function}
 */
class Navigator {
  #routes;
  get version() {
    return '1.0.4';
  }
  /**
   * Переключает страницы
   */
  constructor() {
    this.addNavEvents();
    this.#routes = [];
  }
  
  /**
   * hides all pages
   * @param {[{path:string, required: bool, element: Page}]}routes
   */
  hideAll(routes) {
    if (routes) {
      for (const route of routes) {
        route.element.hidePage();
        this.hideAll(route.children);
      }
    }
  }
  
  /**
   * shows children that match path
   * @param {[{path:string, required: bool, element: Page}]}children
   * @param {string}path
   */
  showChildren(children, path) {
    if (!children) {
      return;
    }
    for (const route of children) {
      if (route.path.raw === 'any' || route.path.alwaysOn) {
        try {
          route.element.requestRender();
        } catch (e) {
          console.error(e);
        }
        this.showChildren(route.childRoutes, path.replace(route.path.raw, ''));
        if (route.path.raw !== 'any' && !route.path.alwaysOn) break;
        
        continue;
      }
      
      const isAppropriate = route.path.exact ?
        route.path.raw === path : route.path.comp.test(path);
      
      if (isAppropriate || route.path.raw === 'any'|| route.path.alwaysOn) {
        try {
          route.element.requestRender();
        } catch (e) {
          console.error(e);
        }
        
        this.showChildren(
          route.childRoutes, path.replace(route.path.raw, ''));
        
        if (route.path.raw !== 'any' && !route.path.alwaysOn) break;
      }
    }
  }
  /**
   * Open requested page in navigator
   * @public
   * @param {string} path
   * @param {boolean} updateLocation
   */
  showPage(path, updateLocation = true, useOldSearch = false) {
    // Hide all pages
    for (const route of this.#routes) {
      const isAppropriate = route.path.exact ?
        route.path.raw === path : (route.path.comp.test(path));
      if (isAppropriate || route.path.raw === 'any' || route.path.alwaysOn) {
        if (window.location.pathname !== path && updateLocation) {
          const newPath = path + ( useOldSearch ? window.location.search : '');
          if (path[0] === '/') {
            window.history.pushState({}, '', newPath);
          } else {
            window.history.pushState({}, '', '/' + newPath);
          }
        }
        try {
          route.element.requestRender();
        } catch (e) {
          console.error(e);
        }
        
        this.showChildren(
          route.childRoutes, path.replace(route.path.raw, ''));
        if (route.path.raw !== 'any' && !route.path.alwaysOn) break;
      }
    }
  }
  
  /**
   * Обработка нажатий на все ссылки с целью перехода на другую страницу
   */
  addNavEvents() {
    window.onpopstate = (e) => {
      const pathname =
        window.location.pathname.replace('/', '');
      // Hide all pages
      let path = '';
      if (pathname[0] === '/') {
        path = pathname.substring(1);
      } else {
        path = pathname;
      }
      for (const route of this.#routes) {
        if (route.path.comp.test(path)) {
          route.element.requestRender();
          this.showChildren(
            route.childRoutes, path.replace(route.path.raw, ''));
          break;
        }
      }
    };
    window.linkGo = (e) => {
      e = e.replace(/&amp;amp;/g, '&');
      if (e[0] === '?') {
        this.showPage(e);
        this.updateAllPages();
      }
      if (e[0] === '/') {
        this.showPage(e);
      } else {
        const loc = window.location.pathname.split('/');
        if (loc[loc.length - 1].length === 0) {
          loc.pop();
        }
        loc.pop();
        const l = loc.join('/');
        this.showPage(l.substr(1) + '/' + e);
      }
    };
  }
  
  /**
   *
   */
  updateAllPages() {
    this.showPage(window.location.pathname);
  }
  _parseObjectRoute = (route) => {
    if ( route ) {
      const {path, exact = false, alwaysOn = false,
        element = null, parent = null, childRoutes = []} = route;
      
      return {
        element,
        path: {
          comp: new RegExp(path),
          raw: path,
          exact,
          alwaysOn,
        },
        parent,
        childRoutes: childRoutes
          .map((c) => this._parseObjectRoute(c))
          .filter((c) => c),
      };
    }
    return null;
  }
  /**
   *
   * @param {any}route
   * @return {{path: {comp: *, exact: *, raw: *},
   * parent: *, childRoutes: *, element: *}|null}
   */
  parseObjectRoute(route) {
    // const parsedRoutes = route.map(this._parseObjectRoute);
    if ( route instanceof Array) {
      const parsed = route.map(this._parseObjectRoute);
      return parsed;
    }
    return this._parseObjectRoute(route);
  }
  
  /**
   * add new routes to this.routes
   * @param {object|Array} root
   * @param {object|Array} route
   */
  _addRoutes(root, route) {
    if (!(route instanceof Array)) {
      if (!(root instanceof Array)) {
        if (root.childRoutes.length === 0) {
          root.childRoutes.push(route);
        } else {
          this._addRoutes(root.childRoutes, route.childRoutes);
        }
        return;
      }
      if (!(root instanceof Array)) {
        for (const newRoute of route ) {
          if (root.path.raw === newRoute.path.raw) {
            this._addRoutes(root.childRoutes, newRoute.childRoutes);
            // root.push(route);
            return;
          } else {
            console.log('something wrong');
          }
        }
        return;
      }
    }
    for (const newRoute of route) {
      let wasFound = false;
      for (const currentRoot of root) {
        if (newRoute.path.raw === currentRoot.path.raw) {
          this._addRoutes(currentRoot.childRoutes, newRoute.childRoutes);
          wasFound = true;
          break;
        }
      }
      if (!wasFound) {
        root.push(newRoute);
      }
    }
  }
  
  /**
   *
   * @param {Object|Array} root
   * @param {Object|Array} route
   * @param {Object|Array} parent
   * @private
   */
  _removeRoutes = (root, route, parent) => {
    if (!(route instanceof Array)) {
      if (!(root instanceof Array)) {
        if (root.childRoutes.length === 0) {
          if (!route.childRoutes) {
            // @TODO check if c === root or c !== root
            parent.childRoutes = parent.childRoutes.filter((c) => c !== root);
          }
        } else {
          this._removeRoutes(root.childRoutes, route.childRoutes, root);
        }
        return;
      }
      if (!(root instanceof Array)) {
        for (const newRoute of route ) {
          if (root.path.raw === newRoute.path.raw) {
            this._removeRoutes(root.childRoutes, newRoute.childRoutes, root);
            return;
          } else {
            console.log('something wrong');
          }
        }
        return;
      }
    }
    for (const newRoute of route) {
      for (const currentRoot of root) {
        if (newRoute.path.raw === currentRoot.path.raw) {
          if (newRoute.childRoutes.length === 0) {
            parent.childRoutes = parent.childRoutes.filter(
              (r) => r !== currentRoot);
            return;
          }
          this._removeRoutes(currentRoot.childRoutes,
            newRoute.childRoutes, currentRoot);
          return;
        }
      }
      this._removeRoutes(root, newRoute.childRoutes, parent);
    }
  }
  
  /**
   * @param {Object|Array} routes
   */
  addRoutes(routes) {
    const r = this.parseObjectRoute(routes);
    this._addRoutes(this.#routes, r);
  }
  
  /**
   * @param {Object|Array} routes
   */
  removeRoutes(routes) {
    const r = this.parseObjectRoute(routes);
    this._removeRoutes(this.#routes, r, null);
  }
}

Navigator = new Navigator();

module.exports = {
  Navigator,
};
