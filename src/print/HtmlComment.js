const prettier = require("prettier");
const { concat, join, indent, hardline } = prettier.doc.builders;
const { createTextGroups } = require("../util");

const stripCommentChars = s => (s.length >= 7 ? s.slice(4, -3) : s);

const p = (node, path, print) => {
    const commentText = stripCommentChars(node.value.value || "");
    const textGroups = createTextGroups(commentText, true, true);

    return concat([
        "<!--",
        indent(join(concat([hardline, hardline]), textGroups)),
        "-->"
    ]);
};

module.exports = {
    printHtmlComment: p
};
