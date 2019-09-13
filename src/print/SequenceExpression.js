const prettier = require("prettier");
const { concat, group, line, join } = prettier.doc.builders;

const p = (node, path, print) => {
    // const docs = [];
    return group(concat([join(line, path.map(print, "expressions"))]));
    // docs.push(group(join(line, path.map(print, "expressions"))));
    // return concat(docs);
};

module.exports = {
    printSequenceExpression: p
};
