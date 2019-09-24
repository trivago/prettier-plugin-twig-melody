const prettier = require("prettier");
const { concat, softline, line, group, join, indent } = prettier.doc.builders;
const { findParentNode } = require("../util");

const textMap = {
    TestNullExpression: "null",
    TestDivisibleByExpression: "divisible by",
    TestDefinedExpression: "defined",
    TestEmptyExpression: "empty",
    TestEvenExpression: "even",
    TestOddExpression: "odd",
    TestIterableExpression: "iterable",
    TestSameAsExpression: "same as"
};

const isNegator = node =>
    node.constructor.name === "UnarySubclass" && node.operator === "not";

const p = (node, path, print) => {
    const expressionType = node.__proto__.type;
    const parts = [path.call(print, "expression"), " is "];
    const parent = findParentNode(path);
    const hasArguments =
        Array.isArray(node.arguments) && node.arguments.length > 0;
    if (isNegator(parent)) {
        parts.push("not ");
    }
    if (!textMap[expressionType]) {
        console.error(
            "TestExpression: No text for " + expressionType + " defined"
        );
    } else {
        parts.push(textMap[expressionType]);
    }
    if (hasArguments) {
        const printedArguments = path.map(print, "arguments");
        const joinedArguments = join(concat([",", line]), printedArguments);
        parts.push(
            group(
                concat([
                    "(",
                    indent(concat([softline, joinedArguments])),
                    softline,
                    ")"
                ])
            )
        );
    }

    return concat(parts);
};

module.exports = {
    printTestExpression: p
};
