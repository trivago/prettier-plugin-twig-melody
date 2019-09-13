const prettier = require("prettier");
const { concat, indent, hardline } = prettier.doc.builders;

const p = (node, path, print) => {
    const docs = [
        "{",
        hardline,
        indent(path.map(print, "properties")),
        hardline,
        "}"
    ];

    return concat(docs);
};

module.exports = {
    printObjectExpression: p
};
