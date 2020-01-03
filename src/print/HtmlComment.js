const prettier = require("prettier");
const { concat, join, indent, hardline } = prettier.doc.builders;
const {
    createTextGroups,
    stripHtmlCommentChars,
    normalizeHtmlComment
} = require("../util");

const p = (node, path, print) => {
    const commentText = stripHtmlCommentChars(node.value.value || "");

    if (commentText.trim() === "prettier-ignore-end") {
        // Weird workaround for a bug I don't understand
        return normalizeHtmlComment(commentText);
    }

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
