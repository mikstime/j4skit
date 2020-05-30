/**
 * Generates unique string (suitable for dom id)
 * @return {string}
 */
const uuid = () =>
  `_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

module.exports = {
  uuid,
}
