const prettier = require("prettier");
const { concat } = prettier.doc.builders;

const p = (node, path, print) => {
    return concat([
        path.call(print, "object"),
        ".",
        path.call(print, "property")
    ]);
};

module.exports = {
    printMemberExpression: p
};
