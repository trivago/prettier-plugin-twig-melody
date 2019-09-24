const p = (node, path, print) => {
    return path.call(print, "argument");
};

module.exports = {
    printUnarySubclass: p
};
