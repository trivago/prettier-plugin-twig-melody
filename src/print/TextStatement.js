const p = (node, path, print) => {
    // Replace the trailing newline with hardline for better readability
    // const trailingNewlineRegex = /\n[^\S\n]*?$/;
    // const hasTrailingNewline = trailingNewlineRegex.test(this.value);
    // const value = hasTrailingNewline
    //     ? this.value.replace(trailingNewlineRegex, '')
    //     : this.value;
    // return concat([
    //     concat(replaceNewlines(value, literalline)),
    //     hasTrailingNewline ? hardline : '',
    // ]);
    return path.call(print, "value");
};

module.exports = {
    printTextStatement: p
};
