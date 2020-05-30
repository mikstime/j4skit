const Page = import('./page.js');
const Navigator = import('./page.js');
console.log(Page)
console.log(Navigator.version);
console.log(Page.version);
module.exports = {
  Navigator,
  Page,
}