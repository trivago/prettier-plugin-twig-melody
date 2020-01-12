const prettier = require("prettier");
const { fill, join } = prettier.doc.builders;
const { STRING_NEEDS_QUOTES, OVERRIDE_QUOTE_CHAR } = require("../util");

const p = (node, path, print) => {
    node[STRING_NEEDS_QUOTES] = true;
    node[OVERRIDE_QUOTE_CHAR] = '"';
    const start = "<!" + (node.declarationType || "").toUpperCase();
    const printedParts = path.map(print, "parts");

    return fill([start, " ", join(" ", printedParts), ">"]);
};

module.exports = {
    printDeclaration: p
};
