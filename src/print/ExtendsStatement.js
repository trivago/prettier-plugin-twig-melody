const prettier = require("prettier");
const { concat } = prettier.doc.builders;
const { STRING_NEEDS_QUOTES } = require("../util");

const p = (node, path, print) => {
    node[STRING_NEEDS_QUOTES] = true;
    return concat(["{% extends ", path.call(print, "parentName"), " %}"]);
};

module.exports = {
    printExtendsStatement: p
};
