const prettier = require("prettier");
const { group, concat } = prettier.doc.builders;
const { quoteChar } = require("../util");

const p = (node, path, print, options) => {
    const parts = [
        "{% include ",
        quoteChar(options),
        path.call(print, "source"),
        quoteChar(options)
    ];
    if (node.argument) {
        const printedArguments = path.call(print, "argument");
        parts.push(" with ");
        parts.push(printedArguments);
    }

    if (node.contextFree) {
        parts.push(" only");
    }
    parts.push(" %}");
    return group(concat(parts));
};

module.exports = {
    printIncludeStatement: p
};
