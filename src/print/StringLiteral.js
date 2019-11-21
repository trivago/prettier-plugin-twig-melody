const {
    firstValueInAncestorChain,
    quoteChar,
    STRING_NEEDS_QUOTES
} = require("../util");

const p = (node, path, print, options) => {
    // The structure this string literal is part of
    // determines if we need quotes or not
    const needsQuotes = firstValueInAncestorChain(
        path,
        STRING_NEEDS_QUOTES,
        false
    );

    if (needsQuotes) {
        const quote = quoteChar(options);
        return quote + node.value + quote;
    }

    return node.value;
};

module.exports = {
    printStringLiteral: p
};
