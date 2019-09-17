const prettier = require("prettier");
const { concat, indent, hardline } = prettier.doc.builders;

const p = (node, path, print) => {
    const docs = [
        indent(path.call(print, "target")),
        hardline,
        "} | ",
        node.name
    ];
    if (node.arguments && node.arguments.length > 0) {
        docs.push("(");
        docs.push(path.call(print, "arguments"));
        docs.push(")");
    }
    const result = concat(docs);
    const b = 5;
    return result;
};

module.exports = {
    printFilterExpression: p
};
