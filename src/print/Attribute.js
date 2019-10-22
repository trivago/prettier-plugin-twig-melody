const prettier = require("prettier");
const { concat } = prettier.doc.builders;
const { EXPRESSION_NEEDED } = require("../util");

const p = (node, path, print = print) => {
    node[EXPRESSION_NEEDED] = false;
    const docs = [path.call(print, "name")];
    node[EXPRESSION_NEEDED] = true;
    if (node.value) {
        docs.push('="');
        docs.push(path.call(print, "value"));
        docs.push('"');
    }

    return concat(docs);
};

module.exports = {
    printAttribute: p
};
