const prettier = require("prettier");
const { concat, hardline } = prettier.doc.builders;
const { processChildExpressions } = require("../util");

// "filter" is parsed as the target of the first
// filter expression, which would output a "|" between "filter"
// and the expression. We remove it.
const removeFirstPipe = expression => {
    let current = expression;
    while (current.contents.parts[0] !== "filter") {
        current = current.contents.parts[0];
    }
    current.contents.parts.splice(1, 1);
};

const p = (node, path, print) => {
    const parts = ["{% "];
    const printedExpression = path.call(print, "filterExpression");
    removeFirstPipe(printedExpression);
    parts.push(printedExpression, " %}");
    const printedBody = path.map(print, "body");
    parts.push(processChildExpressions(printedBody));
    parts.push(concat([hardline, "{% endfilter %}"]));
    return concat(parts);
};

module.exports = {
    printFilterBlockStatement: p
};
