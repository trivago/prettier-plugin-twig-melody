const prettier = require("prettier");
const { concat, indent, hardline } = prettier.doc.builders;

const p = (node, path, print) => {
    const docs = [
        indent(path.call(print, "target")),
        hardline,
        "} | ",
        this.name
    ];
    if (this.arguments && this.arguments.length > 0) {
        docs.push("(");
        docs.push(path.call(print, "arguments"));
        docs.push(")");
    }
    return concat(docs);
};

module.exports = {
    printFilterExpression: p
};
