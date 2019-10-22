const prettier = require("prettier");
const { group, join, concat, line } = prettier.doc.builders;
const { Node } = require("melody-types");
const {
    EXPRESSION_NEEDED,
    needsExpressionEnvironment,
    wrapInEnvironment
} = require("../util");

const printOneOperand = (node, path, print, nodePath) => {
    return concat([
        line,
        node.operator,
        " ",
        path.call(print, ...nodePath, "right")
    ]);
};

const p = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;

    let currentNode = node;
    const pathToFinalLeftHandSide = ["left"];
    const binaryExpressions = [printOneOperand(node, path, print, [])];

    // Here, we do not do the usual recursion using path.call(), but
    // instead traverse the chain of BinaryExpressions ourselves (in
    // case there are multiple chained BinaryExpressions, that is).
    // Reason: For a proper layout like this
    // cond1 or
    // cond2 or
    // cond3 or
    // cond4
    // we need all the individual binary expressions in one group. This
    // can only be achieved by collecting them manually in the top-level
    // BinaryExpression node.
    while (Node.isBinaryExpression(currentNode.left)) {
        binaryExpressions.unshift(
            printOneOperand(
                currentNode.left,
                path,
                print,
                pathToFinalLeftHandSide
            )
        );
        pathToFinalLeftHandSide.push("left"); // Go one level deeper
        currentNode = currentNode.left;
    }
    binaryExpressions.unshift(path.call(print, ...pathToFinalLeftHandSide));

    if (needsExpressionEnvironment(path)) {
        wrapInEnvironment(binaryExpressions);
    }

    return group(join("", binaryExpressions));
};

module.exports = {
    printBinaryExpression: p
};
