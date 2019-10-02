const prettier = require("prettier");
const { concat, line } = prettier.doc.builders;
const {
    isWhitespaceOnly,
    countNewlines,
    TEXT_SPACE,
    TEXT_NEWLINE
} = require("../util");

/**
 * Should only be called for strings that contain only whitespace
 *
 * @param {String} s The string to format
 */
const formatWhitespace = s => {
    // Multiple empty lines should be compacted into one (empty
    // string will be filtered out)
    if (s === "") {
        return "";
    }

    const newlines = countNewlines(s);
    if (newlines === 0) {
        // Whitespace with no newlines surrounding it
        // is probably meaningful
        return " ";
    } else if (newlines > 1) {
        return concat([""]);
    }
    return "";
};

const compactStringParts = parts => {
    const acc = parts.reduce(
        (context, curr) => {
            if (curr !== "") {
                if (isWhitespaceOnly(curr)) {
                    // Remove leading whitespace
                    if (context.result.length > 0) {
                        const formattedWhitespace = formatWhitespace(curr);
                        if (
                            formattedWhitespace === "" &&
                            curr !== "" &&
                            context.previousText
                        ) {
                            // "Do this.\nOr, do that!"
                            context.suppressedWhitespace = true;
                        } else {
                            context.result.push(formattedWhitespace);
                            context.previousText = false;
                        }
                    }
                } else {
                    if (context.suppressedWhitespace) {
                        context.result.push(" ");
                    }
                    context.result.push(curr);
                    context.previousText = true;
                    context.suppressedWhitespace = false;
                }
            }
            return context;
        },
        {
            result: [],
            previousText: false,
            suppressedWhitespace: false
        }
    );
    return acc.result;
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

    const rawString = path.call(print, "value");
    if (isWhitespaceOnly(rawString)) {
        return formatWhitespace(rawString);
    }
    // Split string by whitespace, but preserving the whitespace
    // "\n   Next\n" => ["", "\n   ", "Next", "\n", ""]
    const parts = rawString.split(/([\s\n]+)/gm);
    const result = concat(compactStringParts(parts));
    return result;
};

module.exports = {
    printTextStatement: p
};
