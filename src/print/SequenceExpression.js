const prettier = require("prettier");
const { group, softline, join } = prettier.doc.builders;
const { Node } = require("melody-types");
const {
    isWhitespaceOnly,
    isInlineElement,
    hasAtLeastTwoNewlines,
    TEXT_SPACE,
    TEXT_NEWLINE
} = require("../util");

const isWhitespaceNode = node => {
    return (
        Node.isPrintTextStatement(node) && isWhitespaceOnly(node.value.value)
    );
};

const preprocessChildren = children => {
    if (!Array.isArray(children)) {
        return children;
    }
    const result = [];
    let previous = null;
    children.forEach((child, index) => {
        const isFirstOrLast = index === 0 || index === children.length - 1;
        const isWhitespace = isWhitespaceNode(child);
        // Remove initial whitespace
        if (isFirstOrLast && isWhitespace) {
            return;
        }
        // Whitespace between two children can be removed
        // if the siblings are not both inline elements
        if (isWhitespace) {
            debugger;
            const next = children.length > index ? children[index + 1] : null;
            if (isInlineElement(previous) && isInlineElement(next)) {
                // Add an (artificial) space to the result
                child[TEXT_SPACE] = true;
                result.push(child);
            } else if (hasAtLeastTwoNewlines(child.value.value)) {
                // Turn multiple empty lines into only one
                child[TEXT_NEWLINE] = true;
                result.push(child);
            }
            return;
        }

        result.push(child);
        previous = child;
    });
    return result;
};

const p = (node, path, print) => {
    node.expressions = preprocessChildren(node.expressions);
    const mappedExpressions = path.map(print, "expressions");

    return group(join(softline, mappedExpressions));
    // From HTML parser: return concat(group(path.map(print, "expressions")), hardline);
};

module.exports = {
    printSequenceExpression: p
};
