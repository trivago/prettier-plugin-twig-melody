const prettier = require("prettier");
const { concat } = prettier.doc.builders;

const p = (node, path, print) => {
    const docs = [
        path.call(print, "left"),
        " ",
        node.operator,
        " ",
        path.call(print, "right")
    ];
    return concat(docs);
};

module.exports = {
    printBinaryExpression: p
};
