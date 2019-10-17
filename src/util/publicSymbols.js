/**
 * These symbols are visible to outside users of
 * the package. For example, they might be useful
 * for plugins.
 */

/**
 * Set this to true on an AST node that might be the
 * parent of a StringLiteral node. The StringLiteral
 * will be enclosed in quotes when this attribute is
 * set to true on the parent.
 */
const STRING_NEEDS_QUOTES = Symbol("STRING_NEEDS_QUOTES");

module.exports = {
    STRING_NEEDS_QUOTES
};
