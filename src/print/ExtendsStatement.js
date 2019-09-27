const prettier = require("prettier");
const { concat } = prettier.doc.builders;

const p = (node, path, print) => {
    return concat(["{% extends ", path.call(print, "parentName"), " %}"]);
};

module.exports = {
    printExtendsStatement: p
};
