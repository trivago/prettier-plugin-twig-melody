const prettier = require("prettier");
const { concat } = prettier.doc.builders;
const {
    createTextGroups,
    stripTwigCommentChars,
    normalizeTwigComment,
    countNewlines
} = require("../util");

const p = node => {
    const originalText = node.value.value || "";
    const commentText = stripTwigCommentChars(originalText);
    const trimLeft = originalText.length >= 3 ? originalText[2] === "-" : false;
    const trimRight =
        originalText.length >= 3 ? originalText.slice(-3, -2) === "-" : false;

    const numNewlines = countNewlines(commentText);
    if (numNewlines === 0) {
        return normalizeTwigComment(commentText, trimLeft, trimRight);
    }

    return concat([
        trimLeft ? "{#-" : "{#",
        commentText,
        trimRight ? "-#}" : "#}"
    ]);
};

module.exports = {
    printTwigComment: p
};
