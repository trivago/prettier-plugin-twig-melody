const prettier = require("prettier");
const { group, concat, line, hardline } = prettier.doc.builders;
const { printChildBlock, STRING_NEEDS_QUOTES } = require("../util");
const { Node } = require("melody-types");

const buildSetStatement = (
    node,
    printedAssignment,
    avoidBreakBeforeClosing
) => {
    return group(
        concat([
            node.trimLeft ? "{%-" : "{%",
            " set ",
            printedAssignment,
            avoidBreakBeforeClosing ? " " : line,
            node.trimRight ? "-%}" : "%}"
        ])
    );
};

const isEmbracingSet = node => {
    return (
        Array.isArray(node.assignments) &&
        node.assignments.length === 1 &&
        Array.isArray(node.assignments[0].value)
    );
};

const printRegularSet = (node, path, print) => {
    const parts = [];
    const hasAssignments =
        Array.isArray(node.assignments) && node.assignments.length > 0;
    if (hasAssignments) {
        const printedAssignments = path.map(print, "assignments");
        printedAssignments.forEach((assignment, index) => {
            const originalAssignment = node.assignments[index];
            const avoidBreakBeforeClosing = Node.isObjectExpression(
                originalAssignment.value
            );
            if (parts.length > 0) {
                parts.push(hardline);
            }
            parts.push(
                buildSetStatement(node, assignment, avoidBreakBeforeClosing)
            );
        });
    }
    return concat(parts);
};

const printEmbracingSet = (node, path, print) => {
    const parts = [
        node.trimLeft ? "{%-" : "{%",
        " set ",
        path.call(print, "assignments", "0", "name"),
        node.trimRightSet ? " -%}" : " %}"
    ];
    node[STRING_NEEDS_QUOTES] = false;
    const printedContents = printChildBlock(
        node,
        path,
        print,
        "assignments",
        "0",
        "value"
    );
    // const printedContents = path.map(print, "assignments", "0", "value");
    parts.push(printedContents);
    parts.push(
        hardline,
        node.trimLeftEndset ? "{%-" : "{%",
        " endset ",
        node.trimRight ? "-%}" : "%}"
    );
    return concat(parts);
};

const p = (node, path, print) => {
    node[STRING_NEEDS_QUOTES] = true;
    if (isEmbracingSet(node)) {
        return printEmbracingSet(node, path, print);
    }
    return printRegularSet(node, path, print);
};

module.exports = {
    printSetStatement: p
};
