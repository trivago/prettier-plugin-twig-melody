const prettier = require("prettier");
const { concat, hardline, group } = prettier.doc.builders;
const { printChildBlock } = require("../util");

const p = (node, path, print) => {
    const parts = [
        node.trimLeft ? "{%-" : "{%",
        " spaceless ",
        node.trimRightSpaceless ? "-%}" : "%}"
    ];
    parts.push(printChildBlock(node, path, print, "body"));
    parts.push(hardline);
    parts.push(
        node.trimLeftEndspaceless ? "{%-" : "{%",
        " endspaceless ",
        node.trimRight ? "-%}" : "%}"
    );
    const result = group(concat(parts));
    return result;
};

module.exports = {
    printSpacelessBlock: p
};
