// Generated automatically by nearley, version 2.19.6
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

  const flatten = list => list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [])
  const prune = d => flatten(d).filter(x => x !== null)
  const join = d => prune(d).join('')
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "MAIN$ebnf$1", "symbols": ["FILTER_LIST"], "postprocess": id},
    {"name": "MAIN$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "MAIN", "symbols": ["IDENTIFIER", "_", "MAIN$ebnf$1"], "postprocess": d => ({ getter: d[0], filters: d[2] || [] })},
    {"name": "FILTER_LIST", "symbols": ["FILTER"]},
    {"name": "FILTER_LIST", "symbols": ["FILTER_LIST", "_", "FILTER"], "postprocess": d => flatten([d[0], d[2]])},
    {"name": "FILTER$ebnf$1", "symbols": []},
    {"name": "FILTER$ebnf$1", "symbols": ["FILTER$ebnf$1", "FILTER_ARG"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "FILTER", "symbols": [{"literal":"|"}, "_", "IDENTIFIER", "FILTER$ebnf$1"], "postprocess":  d => ({
          name: d[2],
          args: d[3]
        }) },
    {"name": "FILTER_ARG", "symbols": [{"literal":":"}, "VALUE"], "postprocess": d => d[1]},
    {"name": "IDENTIFIER$ebnf$1", "symbols": []},
    {"name": "IDENTIFIER$ebnf$1", "symbols": ["IDENTIFIER$ebnf$1", /[a-zA-Z0-9_$]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "IDENTIFIER", "symbols": ["ID_START", "IDENTIFIER$ebnf$1"], "postprocess": join},
    {"name": "ID_START", "symbols": [/[a-zA-Z$_]/], "postprocess": id},
    {"name": "VALUE", "symbols": ["NUMBER"], "postprocess": id},
    {"name": "VALUE", "symbols": ["STRING"], "postprocess": id},
    {"name": "VALUE", "symbols": ["SYMBOL"], "postprocess": id},
    {"name": "SYMBOL$ebnf$1", "symbols": [/[a-zA-Z]/]},
    {"name": "SYMBOL$ebnf$1", "symbols": ["SYMBOL$ebnf$1", /[a-zA-Z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "SYMBOL", "symbols": ["SYMBOL$ebnf$1"], "postprocess": join},
    {"name": "NUMBER$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "NUMBER$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "NUMBER$subexpression$1", "symbols": [{"literal":"0"}]},
    {"name": "NUMBER$subexpression$1$ebnf$1", "symbols": []},
    {"name": "NUMBER$subexpression$1$ebnf$1", "symbols": ["NUMBER$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "NUMBER$subexpression$1", "symbols": [/[1-9]/, "NUMBER$subexpression$1$ebnf$1"]},
    {"name": "NUMBER$ebnf$2$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "NUMBER$ebnf$2$subexpression$1$ebnf$1", "symbols": ["NUMBER$ebnf$2$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "NUMBER$ebnf$2$subexpression$1", "symbols": [{"literal":"."}, "NUMBER$ebnf$2$subexpression$1$ebnf$1"]},
    {"name": "NUMBER$ebnf$2", "symbols": ["NUMBER$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "NUMBER$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "NUMBER$ebnf$3$subexpression$1$ebnf$1", "symbols": [/[+-]/], "postprocess": id},
    {"name": "NUMBER$ebnf$3$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "NUMBER$ebnf$3$subexpression$1$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "NUMBER$ebnf$3$subexpression$1$ebnf$2", "symbols": ["NUMBER$ebnf$3$subexpression$1$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "NUMBER$ebnf$3$subexpression$1", "symbols": [/[eE]/, "NUMBER$ebnf$3$subexpression$1$ebnf$1", "NUMBER$ebnf$3$subexpression$1$ebnf$2"]},
    {"name": "NUMBER$ebnf$3", "symbols": ["NUMBER$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "NUMBER$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "NUMBER", "symbols": ["NUMBER$ebnf$1", "NUMBER$subexpression$1", "NUMBER$ebnf$2", "NUMBER$ebnf$3"], "postprocess":  d => {
          return Number.parseFloat(
            join(d)
          )
        } },
    {"name": "STRING", "symbols": ["SINGLE_QUOTE_STRING"], "postprocess": id},
    {"name": "STRING", "symbols": ["DOUBLE_QUOTE_STRING"], "postprocess": id},
    {"name": "SINGLE_QUOTE_STRING$ebnf$1", "symbols": []},
    {"name": "SINGLE_QUOTE_STRING$ebnf$1", "symbols": ["SINGLE_QUOTE_STRING$ebnf$1", "SINGLE_QUOTE_CHAR"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "SINGLE_QUOTE_STRING", "symbols": [{"literal":"'"}, "SINGLE_QUOTE_STRING$ebnf$1", {"literal":"'"}], "postprocess": d => join(d[1])},
    {"name": "DOUBLE_QUOTE_STRING$ebnf$1", "symbols": []},
    {"name": "DOUBLE_QUOTE_STRING$ebnf$1", "symbols": ["DOUBLE_QUOTE_STRING$ebnf$1", "DOUBLE_QUOTE_CHAR"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "DOUBLE_QUOTE_STRING", "symbols": [{"literal":"\""}, "DOUBLE_QUOTE_STRING$ebnf$1", {"literal":"\""}], "postprocess": d => join(d[1])},
    {"name": "SINGLE_QUOTE_CHAR", "symbols": [/[^']/], "postprocess": id},
    {"name": "SINGLE_QUOTE_CHAR$string$1", "symbols": [{"literal":"\\"}, {"literal":"'"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "SINGLE_QUOTE_CHAR", "symbols": ["SINGLE_QUOTE_CHAR$string$1"], "postprocess": () => "'"},
    {"name": "DOUBLE_QUOTE_CHAR", "symbols": [/[^"]/], "postprocess": id},
    {"name": "DOUBLE_QUOTE_CHAR$string$1", "symbols": [{"literal":"\\"}, {"literal":"\""}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "DOUBLE_QUOTE_CHAR", "symbols": ["DOUBLE_QUOTE_CHAR$string$1"], "postprocess": () => '"'},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "WSCHAR"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": d => d[0] ? ' ' : null},
    {"name": "WSCHAR", "symbols": [/[ \t\n\v\f]/], "postprocess": join}
]
  , ParserStart: "MAIN"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
