const isDomElement = (e) => e instanceof HTMLElement;
const hasId = (e) => e.id;
const isBody = (e) => e === document.body;
const isString = (s) => typeof s === 'string';

module.exports = {
  isDomElement,
  hasId,
  isString,
  isBody,
};
