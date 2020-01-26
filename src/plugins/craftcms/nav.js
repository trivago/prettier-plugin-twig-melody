const { Node, type } = require("melody-types");
const {
    Types,
    setStartFromToken,
    setEndFromToken,
    hasTagStartTokenTrimLeft,
    hasTagEndTokenTrimRight
} = require("melody-parser");

function CraftCMS_NavStatement() {
    Node.call(this);
    this.keyTarget = null;
    this.sequence = null;
    this.body = null;
}
CraftCMS_NavStatement.prototype = Object.create(Node.prototype, {
    constructor: { value: CraftCMS_NavStatement }
});
type(CraftCMS_NavStatement, "CraftCMS_NavStatement");

function CraftCMS_ChildrenStatement() {
    Node.call(this);
}
CraftCMS_ChildrenStatement.prototype = Object.create(Node.prototype, {
    constructor: { value: CraftCMS_ChildrenStatement }
});
type(CraftCMS_ChildrenStatement, "CraftCMS_ChildrenStatement");

function CraftCMS_IfChildrenStatement() {
    Node.call(this);
    this.body = null;
}
CraftCMS_IfChildrenStatement.prototype = Object.create(Node.prototype, {
    constructor: { value: CraftCMS_IfChildrenStatement }
});
type(CraftCMS_IfChildrenStatement, "CraftCMS_IfChildrenStatement");

const NavParser = {
    name: "nav",
    parse: (parser, token) => {
        const tokenStream = parser.tokens;
        const result = new CraftCMS_NavStatement();
        const tagOpenToken = tokenStream.la(-1);
        let endnavStartToken = null;

        result.keyTarget = tokenStream.expect(Types.SYMBOL);

        tokenStream.expect(Types.OPERATOR, "in");
        result.sequence = parser.matchExpression();
        const openingTagEndToken = tokenStream.expect(Types.TAG_END);

        result.body = parser.parse((tokenText, token, tokenStream) => {
            const result =
                token.type === Types.TAG_START &&
                tokenStream.nextIf(Types.SYMBOL, "endnav");
            if (result) {
                endnavStartToken = token;
            }
            return result;
        });

        setStartFromToken(result, tagOpenToken);
        setEndFromToken(result, tokenStream.expect(Types.TAG_END));

        result.trimRightNav = !!(
            openingTagEndToken && hasTagEndTokenTrimRight(openingTagEndToken)
        );
        result.trimLeftEndnav = !!(
            endnavStartToken && hasTagStartTokenTrimLeft(endnavStartToken)
        );

        return result;
    }
};

const ChildrenParser = {
    name: "children",
    parse: (parser, token) => {
        const tokenStream = parser.tokens;
        const result = new CraftCMS_ChildrenStatement();

        setStartFromToken(result, token);
        setEndFromToken(result, tokenStream.expect(Types.TAG_END));
        return result;
    }
};

const IfChildrenParser = {
    name: "ifchildren",
    parse: (parser, token) => {
        const tokenStream = parser.tokens;
        const result = new CraftCMS_IfChildrenStatement();
        let endifchildrenStartToken;

        const openingTagEndToken = tokenStream.expect(Types.TAG_END);

        result.body = parser.parse((tokenText, token, tokenStream) => {
            const result =
                token.type === Types.TAG_START &&
                tokenStream.test(Types.SYMBOL, "endifchildren");
            if (result) {
                endifchildrenStartToken = token;
            }
            return result;
        });

        result.trimRightIfChildren = !!(
            openingTagEndToken && hasTagEndTokenTrimRight(openingTagEndToken)
        );
        result.trimLeftEndIfChildren = !!(
            endifchildrenStartToken &&
            hasTagStartTokenTrimLeft(endifchildrenStartToken)
        );

        return result;
    }
};

const printNav = (node, path, print) => {
    return "nav";
};

const printChildren = (node, path, print) => {
    return "children";
};

const printIfChildren = (node, path, print) => {
    return "ifchildren";
};

module.exports = {
    NavParser,
    ChildrenParser,
    IfChildrenParser,
    printNav,
    printChildren,
    printIfChildren
};
