const prettier = require("prettier");
const { line, indent, concat, group } = prettier.doc.builders;
const { Node } = require("melody-types");

const noSpaceBeforeToken = {
    ",": true
};

const printSingleTwigTag = (node, path, print) => {
    const opener = node.trimLeft ? "{%-" : "{%";
    const parts = [opener, " ", node.tagName];
    const printedParts = path.map(print, "parts");
    if (printedParts.length > 0) {
        parts.push(" ", printedParts[0]);
    }
    const indentedParts = [];
    for (let i = 1; i < node.parts.length; i++) {
        const part = node.parts[i];
        const isToken = Node.isGenericToken(part);
        const separator =
            isToken && noSpaceBeforeToken[part.tokenText] ? "" : line;
        indentedParts.push(separator, printedParts[i]);
    }
    if (node.parts.length > 1) {
        parts.push(indent(concat(indentedParts)));
    }
    const closing = node.trimRight ? "-%}" : "%}";
    parts.push(line, closing);
    return group(concat(parts));
};

module.exports = {
    printSingleTwigTag
};
