const prettier = require("prettier");
const { group, concat, indent, line, softline, join } = prettier.doc.builders;
const { Node } = require("melody-types");

const printGroup = (prefix, elements, separator, suffix) => {
    return group(
        concat([
            prefix,
            indent(concat([softline, join(separator, elements)])),
            softline,
            suffix
        ])
    );
};

const printOneFilterExpression = (node, path, print, nodePath) => {
    const hasArguments = node.arguments && node.arguments.length > 0;
    const printedArguments = hasArguments
        ? path.map(print, ...nodePath, "arguments")
        : [];
    const args = hasArguments
        ? printGroup("(", printedArguments, concat([",", line]), ")")
        : "";
    const filterName = path.call(print, ...nodePath, "name");
    return concat([filterName, args]);
};

const joinFilters = filterExpressions => {
    return join(concat([line, "| "]), filterExpressions);
};

const p = (node, path, print) => {
    let currentNode = node;
    const pathToFinalTarget = ["target"];
    let filterExpressions = [printOneFilterExpression(node, path, print, [])];

    // Here, we do not do the usual recursion using path.call(), but
    // instead traverse the chain of FilterExpressions ourselves (in
    // case there are multiple chained FilterExpressions, that is).
    // Reason: For a proper layout like this
    // "Some text"
    //     | filter1
    //     | filter2(arg)
    //     | filter3
    // we need all the individual filter expressions in one group. This
    // can only be achieved by collecting them manually in the top-level
    // FilterExpression node.
    while (Node.isFilterExpression(currentNode.target)) {
        filterExpressions.unshift(
            printOneFilterExpression(
                currentNode.target,
                path,
                print,
                pathToFinalTarget
            )
        );
        pathToFinalTarget.push("target"); // Go one level deeper
        currentNode = currentNode.target;
    }

    const finalTarget = path.call(print, ...pathToFinalTarget);
    const isFilterBlock = finalTarget === "filter"; // Special case of FilterBlockStatement
    const parts = [finalTarget];
    if (isFilterBlock) {
        parts.push(concat([" ", filterExpressions[0]]));
        filterExpressions = filterExpressions.slice(1);
    }
    if (filterExpressions.length > 0) {
        const indentedFilters = concat([
            line,
            "| ",
            joinFilters(filterExpressions)
        ]);
        parts.push(indent(indentedFilters));
    }

    return group(concat(parts));
};

module.exports = {
    printFilterExpression: p
};
