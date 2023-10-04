const prettier = require("prettier");
const { group, indent, line, hardline } = prettier.doc.builders;
const { EXPRESSION_NEEDED, STRING_NEEDS_QUOTES } = require("../util");

const formatDelay = (delay) => {
    return "" + delay / 1000 + "s";
};

const buildOpener = (node, path, print) => {
    const result = [];
    const firstGroup = [node.trimLeft ? "{%-" : "{%", " mount"];
    if (node.async === true) {
        firstGroup.push(" async");
    }

    if (node.name) {
        firstGroup.push(" ", path.call(print, "name"));
    }

    if (node.name && node.source) {
        firstGroup.push(" from");
    }

    if (node.source) {
        firstGroup.push(" ", path.call(print, "source"));
    }

    if (node.key) {
        firstGroup.push(indent([line, "as ", path.call(print, "key")]));
    }
    result.push(group(firstGroup));
    if (node.argument) {
        result.push(indent([" with ", path.call(print, "argument")]));
    }
    if (node.delayBy) {
        result.push(
            indent([line, "delay placeholder by ", formatDelay(node.delayBy)])
        );
    }
    const trimRightMount =
        node.body || node.otherwise ? node.trimRightMount : node.trimRight;
    result.push([line, trimRightMount ? "-%}" : "%}"]);
    return group(result);
};

const buildBody = (path, print) => {
    return indent([hardline, path.call(print, "body")]);
};

const buildErrorHandling = (node, path, print) => {
    const parts = [];
    parts.push([hardline, node.trimLeftCatch ? "{%-" : "{%", " catch "]);
    if (node.errorVariableName) {
        parts.push(path.call(print, "errorVariableName"), " ");
    }
    parts.push(node.trimRightCatch ? "-%}" : "%}");
    parts.push(indent([hardline, path.call(print, "otherwise")]));
    return parts;
};

const p = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;
    const parts = [buildOpener(node, path, print)];
    if (node.body) {
        parts.push(buildBody(path, print));
    }
    if (node.otherwise) {
        parts.push(buildErrorHandling(node, path, print));
    }
    if (node.body || node.otherwise) {
        parts.push([
            hardline,
            node.trimLeftEndmount ? "{%-" : "{%",
            " endmount ",
            node.trimRight ? "-%}" : "%}",
        ]);
    }

    return parts;
};

module.exports = {
    printMountStatement: p,
};
