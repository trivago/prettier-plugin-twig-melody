const {
    firstValueInAncestorChain,
    quoteChar,
    STRING_NEEDS_QUOTES,
    OVERRIDE_QUOTE_CHAR
} = require("../util");

const p = (node, path, print, options) => {
    // The structure this string literal is part of
    // determines if we need quotes or not
    const needsQuotes = firstValueInAncestorChain(
        path,
        STRING_NEEDS_QUOTES,
        false
    );
    const overridingQuoteChar = firstValueInAncestorChain(
        path,
        OVERRIDE_QUOTE_CHAR,
        null
    );

    if (needsQuotes) {
        const quote = overridingQuoteChar
            ? overridingQuoteChar
            : quoteChar(options);
        return quote + node.value + quote;
    }

    return node.value;
};

module.exports = {
    printStringLiteral: p
};
