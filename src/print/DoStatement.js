const prettier = require("prettier");
const { concat } = prettier.doc.builders;

const p = (node, path, print) => {
    return concat(["{% do ", path.call(print, "value"), " %}"]);
};

module.exports = {
    printDoStatement: p
};
