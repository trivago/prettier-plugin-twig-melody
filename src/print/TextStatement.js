const prettier = require("prettier");
const { concat, fill, line, join, hardline } = prettier.doc.builders;
const {
    isWhitespaceOnly,
    countNewlines,
    TEXT_SPACE,
    TEXT_NEWLINE,
    PRESERVE_LEADING_WHITESPACE,
    PRESERVE_TRAILING_WHITESPACE
} = require("../util");

/**
 * Should only be called for strings that contain only whitespace
 *
 * @param {String} s The string to format
 */
const formatWhitespace = (s, preserveWhitespace = false) => {
    // Multiple empty lines should be compacted into one (empty
    // string will be filtered out)
    // if (s === "") {
    //     return "";
    // }

    const newlines = countNewlines(s);
    if (newlines === 0 && preserveWhitespace) {
        return " ";
    } else if (newlines > 1) {
        return concat([""]);
    }
    return "";
};

const createTextGroups = (
    s,
    preserveLeadingWhitespace,
    preserveTrailingWhitespace
) => {
    // Split string by whitespace, but preserving the whitespace
    // "\n   Next\n" => ["", "\n   ", "Next", "\n", ""]
    const parts = s.split(/([\s\n]+)/gm);
    const groups = [];
    let currentGroup = [];
    const len = parts.length;
    parts.forEach((curr, index) => {
        if (curr !== "") {
            if (isWhitespaceOnly(curr)) {
                const isFirst =
                    groups.length === 0 && currentGroup.length === 0;
                const isLast =
                    index === len - 1 ||
                    (index === len - 2 && parts[len - 1] === "");
                // Remove leading whitespace if allowed
                if (isFirst && preserveLeadingWhitespace) {
                    // Normalize to one single space
                    currentGroup.push(line);
                } else if (isLast && preserveTrailingWhitespace) {
                    // Remove trailing whitespace if allowed
                    currentGroup.push(line);
                } else if (!isFirst && !isLast) {
                    const numNewlines = countNewlines(curr);
                    if (numNewlines <= 1) {
                        currentGroup.push(line);
                    } else {
                        groups.push(currentGroup);
                        currentGroup = [];
                    }
                }
            } else {
                currentGroup.push(curr);
            }
        }
    });

    if (currentGroup.length > 0) {
        groups.push(currentGroup);
    }
    return groups;
};

const p = (node, path, print) => {
    // Check for special values that might have been
    // computed during preprocessing
    if (node[TEXT_SPACE]) {
        return line;
    }
    if (node[TEXT_NEWLINE]) {
        return "";
    }
    const preserveLeadingWhitespace =
        node[PRESERVE_LEADING_WHITESPACE] === true;
    const preserveTrailingWhitespace =
        node[PRESERVE_TRAILING_WHITESPACE] === true;

    const rawString = path.call(print, "value");
    // if (isWhitespaceOnly(rawString)) {
    //     return formatWhitespace(rawString);
    // }

    const textGroups = createTextGroups(
        rawString,
        preserveLeadingWhitespace,
        preserveTrailingWhitespace
    );
    const printedGroups = textGroups.reduce(
        (acc, curr) => [...acc, fill(curr)],
        []
    );
    const result = join(concat([hardline, hardline]), printedGroups);
    return result;
};

module.exports = {
    printTextStatement: p
};
