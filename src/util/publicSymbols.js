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

/**
 * This signals to child nodes that an expression environment
 * {{ ... }} has not yet been opened, so they might have
 * to open one. Example: An Element node, in its attributes
 * array, can directly contain a FilterExpression. Usually,
 * a FilterExpression does not open an {{...}} environment,
 * but here, it has to.
 */
const EXPRESSION_NEEDED = Symbol("EXPRESSION_NEEDED");

/**
 * Signals to child nodes that they are part of a string,
 * which means that expressions have to be interpolated.
 * Example:
 * "Part #{ partNr } of #{ partCount }"
 */
const INSIDE_OF_STRING = Symbol("INSIDE_OF_STRING");

const FILTER_BLOCK = Symbol("FILTER_BLOCK");

module.exports = {
    STRING_NEEDS_QUOTES,
    INSIDE_OF_STRING,
    EXPRESSION_NEEDED,
    FILTER_BLOCK
};
