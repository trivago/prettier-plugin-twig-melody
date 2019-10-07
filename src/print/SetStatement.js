const prettier = require("prettier");
const { group, concat, line, hardline } = prettier.doc.builders;
const { printChildBlock } = require("../util");

const buildSetStatement = printedAssignment => {
    return group(concat(["{% set ", printedAssignment, line, "%}"]));
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
        printedAssignments.forEach(assignment => {
            if (parts.length > 0) {
                parts.push(hardline);
            }
            parts.push(buildSetStatement(assignment));
        });
    }
    return concat(parts);
};

const printEmbracingSet = (node, path, print) => {
    const parts = [
        "{% set ",
        path.call(print, "assignments", "0", "name"),
        " %}"
    ];
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
    parts.push(hardline, "{% endset %}");
    return concat(parts);
};

const p = (node, path, print) => {
    if (isEmbracingSet(node)) {
        return printEmbracingSet(node, path, print);
    }
    return printRegularSet(node, path, print);
};

module.exports = {
    printSetStatement: p
};
