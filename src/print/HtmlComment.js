const prettier = require("prettier");
const { join, indent, hardline } = prettier.doc.builders;
const {
    createTextGroups,
    stripHtmlCommentChars,
    normalizeHtmlComment,
    countNewlines,
} = require("../util");

const p = (node, path, print) => {
    const commentText = stripHtmlCommentChars(node.value.value || "");

    const numNewlines = countNewlines(commentText);
    if (numNewlines === 0) {
        return normalizeHtmlComment(commentText);
    }

    return ["<!-- ", commentText, " -->"];
};

module.exports = {
    printHtmlComment: p,
};
