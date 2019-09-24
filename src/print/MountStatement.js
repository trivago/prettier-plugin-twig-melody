const prettier = require("prettier");
const { group, concat, indent, line, hardline } = prettier.doc.builders;

const formatDelay = delay => {
    return "" + delay / 1000 + "s";
};

const buildOpener = (node, path, print) => {
    const parts = ["{% mount"];
    const printedSource = path.call(print, "source");
    if (node.async === true) {
        parts.push(" async");
    }
    const indentedParts = [line, printedSource];
    if (node.key) {
        indentedParts.push(line, "as ", path.call(print, "key"));
    }
    if (node.argument) {
        indentedParts.push(line, "with ", path.call(print, "argument"));
    }
    if (node.delayBy) {
        indentedParts.push(
            line,
            "delay placeholder by ",
            formatDelay(node.delayBy)
        );
    }

    parts.push(indent(concat(indentedParts)));
    parts.push(concat([line, "%}"]));
    return group(concat(parts));
};

const buildBody = (path, print) => {
    return indent(concat([hardline, path.call(print, "body")]));
};

const buildErrorHandling = (node, path, print) => {
    const parts = [];
    parts.push(concat([hardline, "{% catch "]));
    if (node.errorVariableName) {
        parts.push(path.call(print, "errorVariableName"), " ");
    }
    parts.push("%}");
    parts.push(indent(concat([hardline, path.call(print, "otherwise")])));
    return concat(parts);
};

const p = (node, path, print) => {
    const parts = [buildOpener(node, path, print)];
    if (node.body) {
        parts.push(buildBody(path, print));
    }
    if (node.otherwise) {
        parts.push(buildErrorHandling(node, path, print));
    }
    if (node.body || node.otherwise) {
        parts.push(concat([hardline, "{% endmount %}"]));
    }

    return concat(parts);
};

module.exports = {
    printMountStatement: p
};
