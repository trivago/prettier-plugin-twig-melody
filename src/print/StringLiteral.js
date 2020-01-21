const {
    firstValueInAncestorChain,
    quoteChar,
    STRING_NEEDS_QUOTES,
    OVERRIDE_QUOTE_CHAR
} = require("../util");

const isUnmaskedOccurrence = (s, pos) => {
    return pos === 0 || s[pos - 1] !== "\\";
};

const containsUnmasked = char => s => {
    let pos = s.indexOf(char);
    while (pos >= 0) {
        if (isUnmaskedOccurrence(s, pos)) {
            return true;
        }
        pos = s.indexOf(char, pos + 1);
    }
    return false;
};

const containsUnmaskedSingleQuote = containsUnmasked("'");
const containsUnmaskedDoubleQuote = containsUnmasked('"');

const getQuoteChar = (s, options) => {
    if (containsUnmaskedSingleQuote(s)) {
        return '"';
    }
    if (containsUnmaskedDoubleQuote(s)) {
        return "'";
    }
    return quoteChar(options);
};

const p = (node, path, print, options) => {
    // The structure this string literal is part of
    // determines if we need quotes or not
    const needsQuotes = firstValueInAncestorChain(
        path,
        STRING_NEEDS_QUOTES,
        false
    );
    // In case of a string with interpolations, only double quotes
    // are allowed. This is then indicated by OVERRIDE_QUOTE_CHAR
    // in an ancestor.
    const overridingQuoteChar = firstValueInAncestorChain(
        path,
        OVERRIDE_QUOTE_CHAR,
        null
    );

    if (needsQuotes) {
        const quote = overridingQuoteChar
            ? overridingQuoteChar
            : getQuoteChar(node.value, options);
        return quote + node.value + quote;
    }

    return node.value;
};

module.exports = {
    printStringLiteral: p
};
