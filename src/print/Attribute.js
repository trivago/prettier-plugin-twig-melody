const prettier = require("prettier");
const { concat } = prettier.doc.builders;
const { isDynamicValue } = require("../util");

const p = (node, path, print = print) => {
    const docs = [path.call(print, "name")];
    if (node.value) {
        docs.push('="');
        if (isDynamicValue(node.value)) {
            docs.push("{{ ");
        }
        docs.push(path.call(print, "value"));
        if (isDynamicValue(node.value)) {
            docs.push(" }}");
        }
        docs.push('"');
    }

    return concat(docs);
};

module.exports = {
    printAttribute: p
};
