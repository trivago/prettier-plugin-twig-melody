const prettier = require("prettier");
const { concat, hardline, softline } = prettier.doc.builders;

const coalesceEmptyLines = lines => {
    const result = [];
    let numEmptyLines = 0;
    lines.forEach(line => {
        if (line === "") {
            numEmptyLines += 1;
        } else {
            if (numEmptyLines > 1) {
                result.push(hardline);
            }
            // result.push(line);
            numEmptyLines = 0;
        }
    });
    if (numEmptyLines > 1) {
        result.push(hardline);
    }
    debugger;
    return result;
};

const isWhitespaceOnly = s => typeof s === "string" && s.trim() === "";

const formatWhitespace = s => {
    // Multiple empty lines should be compacted into one
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

const countNewlines = s => {
    return (s.match(/\n/g) || "").length;
};

const compactStringParts = parts => {
    return parts.reduce((acc, curr) => {
        if (curr !== "") {
            if (isWhitespaceOnly(curr)) {
                acc.push(formatWhitespace(curr));
            } else {
                acc.push(curr);
            }
        }
        return acc;
    }, []);
};

const p = (node, path, print) => {
    const rawString = path.call(print, "value");
    if (isWhitespaceOnly(rawString)) {
        return formatWhitespace(rawString);
    }
    // Split string by whitespace, but preserving the whitespace
    // "\n   Next\n" => ["", "\n   ", "Next", "\n", ""]
    const parts = rawString.split(/([\s\n]+)/gm);
    const result = concat(compactStringParts(parts));
    // debugger;
    return result;

    // const lines = rawString.split("\n").map(s => s.trim());
    // const coalesced = coalesceEmptyLines(lines);
    // const result = concat(coalesced);
    // debugger;
    // return result;
};

module.exports = {
    printTextStatement: p
};
