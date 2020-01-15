const prettier = require("prettier");
const { group, concat } = prettier.doc.builders;
const { STRING_NEEDS_QUOTES } = require("../util");

const p = (node, path, print) => {
    node[STRING_NEEDS_QUOTES] = true;
    const parts = [
        node.trimLeft ? "{%-" : "{%",
        " include ",
        path.call(print, "source")
    ];
    if (node.argument) {
        const printedArguments = path.call(print, "argument");
        parts.push(" with ");
        parts.push(printedArguments);
    }

    if (node.contextFree) {
        parts.push(" only");
    }
    parts.push(node.trimRight ? " -%}" : " %}");
    return group(concat(parts));
};

module.exports = {
    printIncludeStatement: p
};
