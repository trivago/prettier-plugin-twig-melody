const prettier = require("prettier");
const { group, concat, indent, line, softline, join } = prettier.doc.builders;
const { Node } = require("melody-types");
const {
    EXPRESSION_NEEDED,
    INSIDE_OF_STRING,
    STRING_NEEDS_QUOTES,
    FILTER_BLOCK,
    shouldExpressionsBeWrapped,
    wrapInStringInterpolation,
    someParentNode,
    isMultipartExpression,
    getDeepProperty
} = require("../util");

const isInFilterBlock = path =>
    someParentNode(path, node => node[FILTER_BLOCK] === true);

const printArguments = (node, path, print, nodePath) => {
    const hasArguments = node.arguments && node.arguments.length > 0;
    if (!hasArguments) {
        return "";
    }

    const printedArguments = path.map(print, ...nodePath, "arguments");
    if (
        node.arguments.length === 1 &&
        Node.isObjectExpression(node.arguments[0])
    ) {
        // Optimization: Avoid additional indentation level
        return group(concat(["(", printedArguments[0], ")"]));
    }

    return group(
        concat([
            "(",
            indent(
                concat([softline, join(concat([",", line]), printedArguments)])
            ),
            softline,
            ")"
        ])
    );
};

const printOneFilterExpression = (node, path, print, nodePath) => {
    const args = printArguments(node, path, print, nodePath);
    const filterName = path.call(print, ...nodePath, "name");
    return concat([filterName, args]);
};

const joinFilters = (filterExpressions, space = "") => {
    return join(
        concat([space === "" ? softline : line, "|", space]),
        filterExpressions
    );
};

const p = (node, path, print, options) => {
    let currentNode = node;
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;
    const spaceAroundPipe = options.twigFollowOfficialCodingStandards === false;
    const space = spaceAroundPipe ? " " : "";
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
    const isFilterBlock = isInFilterBlock(path); // Special case of FilterBlockStatement
    const targetNeedsParentheses = isMultipartExpression(
        getDeepProperty(node, ...pathToFinalTarget)
    );
    const parts = [];
    if (targetNeedsParentheses) {
        parts.push("(");
    }
    parts.push(finalTarget);
    if (targetNeedsParentheses) {
        parts.push(")");
    }
    if (isFilterBlock) {
        parts.push(concat([" ", filterExpressions[0]]));
        filterExpressions = filterExpressions.slice(1);
    }
    if (filterExpressions.length === 1) {
        // No breaks and indentation for just one expression
        parts.push(`${space}|${space}`, filterExpressions[0]);
    } else if (filterExpressions.length > 1) {
        const indentedFilters = concat([
            spaceAroundPipe ? line : softline,
            `|${space}`,
            joinFilters(filterExpressions, space)
        ]);
        parts.push(indent(indentedFilters));
    }

    const kindOfWrap = shouldExpressionsBeWrapped(path);
    if (kindOfWrap === EXPRESSION_NEEDED) {
        // Instead of using wrapExpressionIfNeeded(), we manually
        // wrap here, to avoid a line break between the curly braces
        parts.push(" }}");
        parts.unshift("{{ ");
    } else if (kindOfWrap === INSIDE_OF_STRING) {
        wrapInStringInterpolation(parts);
    }

    return group(concat(parts));
};

module.exports = {
    printFilterExpression: p
};
