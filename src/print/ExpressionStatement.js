const prettier = require("prettier");
const { concat } = prettier.doc.builders;

const p = (node, path, print) => {
    const docs = ["{{ ", path.call(print, "value"), " }}"];

    return concat(docs);
};

module.exports = {
    printExpressionStatement: p
};
