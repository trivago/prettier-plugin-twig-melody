const prettier = require("prettier");
const { group, hardline, softline, join } = prettier.doc.builders;

const p = (node, path, print) => {
    const mappedExpressions = path.map(print, "expressions");

    return group(join(softline, mappedExpressions));
    // From HTML parser: return concat(group(path.map(print, "expressions")), hardline);
    // docs.push(group(join(line, path.map(print, "expressions"))));
    // return concat(docs);
};

module.exports = {
    printSequenceExpression: p
};
