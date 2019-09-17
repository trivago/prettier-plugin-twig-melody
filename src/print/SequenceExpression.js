const prettier = require("prettier");
const { concat, group, softline, join } = prettier.doc.builders;

const p = (node, path, print) => {
    // const docs = [];
    return group(concat([join(softline, path.map(print, "expressions"))]));
    // From HTML parser: return concat(group(path.map(print, "expressions")), hardline);
    // docs.push(group(join(line, path.map(print, "expressions"))));
    // return concat(docs);
};

module.exports = {
    printSequenceExpression: p
};
