const prettier = require("prettier");
const { group, hardline, concat, softline, fill, join } = prettier.doc.builders;
const {
    removeSurroundingWhitespace,
    printChildGroups,
    createInlineMap,
    addPreserveWhitespaceInfo,
    textStatementsOnlyNewlines
} = require("../util");

const addNewlineIfNotEmpty = items => {
    if (items.length > 0) {
        items.push(hardline);
    }
};

const arrangeElements = (node, path, print) => {
    const result = [];
    const inlineMap = createInlineMap(node.expressions);
    addPreserveWhitespaceInfo(inlineMap, node.expressions);

    let inlineGroup = [];
    const printedChildren = path.map(print, "expressions");
    node.expressions.forEach((child, index) => {
        if (inlineMap[index]) {
            inlineGroup.push(printedChildren[index]);
        } else {
            if (inlineGroup.length > 0) {
                // addNewlineIfNotEmpty(result);
                result.push(fill(inlineGroup));
                inlineGroup = [];
            }
            if (result.length > 0 && !inlineMap[index - 1]) {
                addNewlineIfNotEmpty(result);
            }
            result.push(printedChildren[index]);
        }
    });
    if (inlineGroup.length > 0) {
        // addNewlineIfNotEmpty(result);
        result.push(fill(inlineGroup));
    }
    return result;
};

const p = (node, path, print) => {
    node.expressions = removeSurroundingWhitespace(node.expressions);
    textStatementsOnlyNewlines(node.expressions);
    const items = arrangeElements(node, path, print);
    return concat(items);

    // const childGroups = printChildGroups(node, path, print, "expressions");
    // return group(join(softline, childGroups));

    // From HTML parser:
    // return concat([group(concat(path.map(print, "expressions"))), hardline]);
};

module.exports = {
    printSequenceExpression: p
};
