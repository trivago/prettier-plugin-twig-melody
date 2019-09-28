const prettier = require("prettier");
const { concat, group, line, softline, hardline } = prettier.doc.builders;
const { processChildExpressions } = require("../util");

const p = (node, path, print) => {
    const parts = ["{% "];
    const printedExpression = path.call(print, "filterExpression");
    parts.push(printedExpression, line, "%}");
    const printedBody = path.map(print, "body");
    parts.push(processChildExpressions(printedBody));
    parts.push(concat([softline, "{% endfilter %}"]));
    return group(concat(parts));
};

module.exports = {
    printFilterBlockStatement: p
};
