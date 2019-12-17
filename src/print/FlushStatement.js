const p = (node, path, print) => {
    const dashLeft = node.trimLeft ? "-" : "";
    const dashRight = node.trimRight ? "-" : "";
    return `{%${dashLeft} flush ${dashRight}%}`;
};

module.exports = {
    printFlushStatement: p
};
