const prettier = require("prettier");
const { indent, hardline } = prettier.doc.builders;
const {
    STRING_NEEDS_QUOTES,
    printSingleTwigTag,
    indentWithHardline,
    isEmptySequence,
} = require("../../src/util");
const { Node } = require("melody-types");

const printSwitch = (node, path, print) => {
    node[STRING_NEEDS_QUOTES] = true;
    const openingTag = printSingleTwigTag(node, path, print);
    const parts = [openingTag];
    const printedSections = path.map(print, "sections");
    node.sections.forEach((section, i) => {
        if (Node.isGenericTwigTag(section)) {
            if (section.tagName === "endswitch") {
                parts.push([hardline, printedSections[i]]);
            } else {
                parts.push(indentWithHardline(printedSections[i]));
            }
        } else {
            if (!isEmptySequence(section)) {
                // Indent twice
                parts.push(indent(indentWithHardline(printedSections[i])));
            }
        }
    });
    return parts;
};

module.exports = {
    printers: {
        switchTag: printSwitch,
    },
};
