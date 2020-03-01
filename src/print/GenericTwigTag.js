const prettier = require("prettier");
const { concat, hardline } = prettier.doc.builders;
const { Node } = require("melody-types");
const {
    STRING_NEEDS_QUOTES,
    indentWithHardline,
    printSingleTwigTag,
    isEmptySequence
} = require("../util");

const p = (node, path, print) => {
    node[STRING_NEEDS_QUOTES] = true;
    const openingTag = printSingleTwigTag(node, path, print);
    const parts = [openingTag];
    const printedSections = path.map(print, "sections");
    node.sections.forEach((section, i) => {
        if (Node.isGenericTwigTag(section)) {
            parts.push(concat([hardline, printedSections[i]]));
        } else {
            if (!isEmptySequence(section)) {
                // Indent
                parts.push(indentWithHardline(printedSections[i]));
            }
        }
    });
    return concat(parts);
};

module.exports = {
    printGenericTwigTag: p
};
