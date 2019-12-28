const prettier = require("prettier");
const { concat, line, join, hardline } = prettier.doc.builders;
const {
    isWhitespaceOnly,
    countNewlines,
    createTextGroups,
    PRESERVE_LEADING_WHITESPACE,
    PRESERVE_TRAILING_WHITESPACE,
    NEWLINES_ONLY
} = require("../util");

const newlinesOnly = (s, preserveWhitespace = true) => {
    const numNewlines = countNewlines(s);
    if (numNewlines === 0) {
        return preserveWhitespace ? line : "";
    } else if (numNewlines === 1) {
        return hardline;
    }
    return concat([hardline, hardline]);
};

const p = (node, path, print) => {
    // Check for special values that might have been
    // computed during preprocessing
    const preserveLeadingWhitespace =
        node[PRESERVE_LEADING_WHITESPACE] === true;
    const preserveTrailingWhitespace =
        node[PRESERVE_TRAILING_WHITESPACE] === true;

    const rawString = path.call(print, "value");
    if (isWhitespaceOnly(rawString) && node[NEWLINES_ONLY]) {
        return newlinesOnly(rawString);
    }

    const textGroups = createTextGroups(
        rawString,
        preserveLeadingWhitespace,
        preserveTrailingWhitespace
    );

    return join(concat([hardline, hardline]), textGroups);
};

module.exports = {
    printTextStatement: p
};
