const prettier = require("prettier");
const { concat } = prettier.doc.builders;

const p = (node, path, print) => {
    const printedTarget = path.call(print, "target");
    const printedStart = node.start ? path.call(print, "start") : "";
    const printedEnd = node.end ? path.call(print, "end") : "";
    return concat([printedTarget, "[", printedStart, ":", printedEnd, "]"]);
};

module.exports = {
    printSliceExpression: p
};
