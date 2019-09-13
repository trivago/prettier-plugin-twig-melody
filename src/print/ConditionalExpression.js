const prettier = require("prettier");
const { concat } = prettier.doc.builders;

const p = (node, path, print) => {
    const docs = [
        path.call(print, "test"),
        " ",
        "?",
        " ",
        path.call(print, "consequent"),
        " ",
        ":",
        " ",
        path.call(print, "alternate")
    ];

    return concat(docs);
};

module.exports = {
    printConditionalExpression: p
};
