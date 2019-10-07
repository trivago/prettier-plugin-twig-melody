const prettier = require("prettier");
const { concat, hardline, group } = prettier.doc.builders;
const { printChildBlock } = require("../util");

const p = (node, path, print) => {
    const opener = "{% spaceless %}";
    const indentedBody = printChildBlock(node, path, print, "body");
    const result = group(
        concat([opener, indentedBody, hardline, "{% endspaceless %}"])
    );
    return result;
};

module.exports = {
    printSpacelessBlock: p
};
