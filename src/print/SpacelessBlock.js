const prettier = require("prettier");
const { concat, softline, group, join, indent } = prettier.doc.builders;
const { printChildren } = require("../util");

const p = (node, path, print) => {
    const opener = "{% spaceless %}";
    const indentedBody = printChildren(path, print, "body");
    const result = group(
        concat([opener, indentedBody, softline, "{% endspaceless %}"])
    );
    return result;
};

module.exports = {
    printSpacelessBlock: p
};
