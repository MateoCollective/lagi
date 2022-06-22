(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('domutils')) :
	typeof define === 'function' && define.amd ? define(['domutils'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.scrapy = factory(global.DomUtils));
}(this, (function (DomUtils) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var DomUtils__default = /*#__PURE__*/_interopDefaultLegacy(DomUtils);

	var boolbase = {
	  trueFunc: function trueFunc() {
	    return true;
	  },
	  falseFunc: function falseFunc() {
	    return false;
	  }
	};

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, basedir, module) {
		return module = {
		  path: basedir,
		  exports: {},
		  require: function (path, base) {
	      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
	    }
		}, fn(module, module.exports), module.exports;
	}

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
	}

	var parse_1 = createCommonjsModule(function (module, exports) {

	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	  exports.default = parse;
	  var reName = /^[^\\]?(?:\\(?:[\da-f]{1,6}\s?|.)|[\w\-\u00b0-\uFFFF])+/;
	  var reEscape = /\\([\da-f]{1,6}\s?|(\s)|.)/gi; //modified version of https://github.com/jquery/sizzle/blob/master/src/sizzle.js#L87

	  var reAttr = /^\s*((?:\\.|[\w\u00b0-\uFFFF-])+)\s*(?:(\S?)=\s*(?:(['"])([^]*?)\3|(#?(?:\\.|[\w\u00b0-\uFFFF-])*)|)|)\s*(i)?\]/;
	  var actionTypes = {
	    undefined: "exists",
	    "": "equals",
	    "~": "element",
	    "^": "start",
	    $: "end",
	    "*": "any",
	    "!": "not",
	    "|": "hyphen"
	  };
	  var Traversals = {
	    ">": "child",
	    "<": "parent",
	    "~": "sibling",
	    "+": "adjacent"
	  };
	  var attribSelectors = {
	    "#": ["id", "equals"],
	    ".": ["class", "element"]
	  }; //pseudos, whose data-property is parsed as well

	  var unpackPseudos = new Set(["has", "not", "matches"]);
	  var stripQuotesFromPseudos = new Set(["contains", "icontains"]);
	  var quotes = new Set(['"', "'"]); //unescape function taken from https://github.com/jquery/sizzle/blob/master/src/sizzle.js#L152

	  function funescape(_, escaped, escapedWhitespace) {
	    var high = parseInt(escaped, 16) - 0x10000; // NaN means non-codepoint

	    return high !== high || escapedWhitespace ? escaped : high < 0 ? // BMP codepoint
	    String.fromCharCode(high + 0x10000) : // Supplemental Plane codepoint (surrogate pair)
	    String.fromCharCode(high >> 10 | 0xd800, high & 0x3ff | 0xdc00);
	  }

	  function unescapeCSS(str) {
	    return str.replace(reEscape, funescape);
	  }

	  function isWhitespace(c) {
	    return c === " " || c === "\n" || c === "\t" || c === "\f" || c === "\r";
	  }

	  function parse(selector, options) {
	    var subselects = [];
	    selector = parseSelector(subselects, "" + selector, options);

	    if (selector !== "") {
	      throw new Error("Unmatched selector: " + selector);
	    }

	    return subselects;
	  }

	  function parseSelector(subselects, selector, options) {
	    var tokens = [];
	    var sawWS = false;

	    function getName() {
	      var match = selector.match(reName);

	      if (!match) {
	        throw new Error("Expected name, found " + selector);
	      }

	      var sub = match[0];
	      selector = selector.substr(sub.length);
	      return unescapeCSS(sub);
	    }

	    function stripWhitespace(start) {
	      while (isWhitespace(selector.charAt(start))) start++;

	      selector = selector.substr(start);
	    }

	    function isEscaped(pos) {
	      var slashCount = 0;

	      while (selector.charAt(--pos) === "\\") slashCount++;

	      return (slashCount & 1) === 1;
	    }

	    stripWhitespace(0);

	    while (selector !== "") {
	      var firstChar = selector.charAt(0);

	      if (isWhitespace(firstChar)) {
	        sawWS = true;
	        stripWhitespace(1);
	      } else if (firstChar in Traversals) {
	        tokens.push({
	          type: Traversals[firstChar]
	        });
	        sawWS = false;
	        stripWhitespace(1);
	      } else if (firstChar === ",") {
	        if (tokens.length === 0) {
	          throw new Error("Empty sub-selector");
	        }

	        subselects.push(tokens);
	        tokens = [];
	        sawWS = false;
	        stripWhitespace(1);
	      } else {
	        if (sawWS) {
	          if (tokens.length > 0) {
	            tokens.push({
	              type: "descendant"
	            });
	          }

	          sawWS = false;
	        }

	        if (firstChar === "*") {
	          selector = selector.substr(1);
	          tokens.push({
	            type: "universal"
	          });
	        } else if (firstChar in attribSelectors) {
	          var _a = attribSelectors[firstChar],
	              name_1 = _a[0],
	              action = _a[1];
	          selector = selector.substr(1);
	          tokens.push({
	            type: "attribute",
	            name: name_1,
	            action: action,
	            value: getName(),
	            ignoreCase: false
	          });
	        } else if (firstChar === "[") {
	          selector = selector.substr(1);
	          var data = selector.match(reAttr);

	          if (!data) {
	            throw new Error("Malformed attribute selector: " + selector);
	          }

	          selector = selector.substr(data[0].length);
	          var name_2 = unescapeCSS(data[1]);

	          if (!options || ("lowerCaseAttributeNames" in options ? options.lowerCaseAttributeNames : !options.xmlMode)) {
	            name_2 = name_2.toLowerCase();
	          }

	          tokens.push({
	            type: "attribute",
	            name: name_2,
	            action: actionTypes[data[2]],
	            value: unescapeCSS(data[4] || data[5] || ""),
	            ignoreCase: !!data[6]
	          });
	        } else if (firstChar === ":") {
	          if (selector.charAt(1) === ":") {
	            selector = selector.substr(2);
	            tokens.push({
	              type: "pseudo-element",
	              name: getName().toLowerCase()
	            });
	            continue;
	          }

	          selector = selector.substr(1);
	          var name_3 = getName().toLowerCase();
	          var data = null;

	          if (selector.charAt(0) === "(") {
	            if (unpackPseudos.has(name_3)) {
	              var quot = selector.charAt(1);
	              var quoted = quotes.has(quot);
	              selector = selector.substr(quoted ? 2 : 1);
	              data = [];
	              selector = parseSelector(data, selector, options);

	              if (quoted) {
	                if (selector.charAt(0) !== quot) {
	                  throw new Error("Unmatched quotes in :" + name_3);
	                } else {
	                  selector = selector.substr(1);
	                }
	              }

	              if (selector.charAt(0) !== ")") {
	                throw new Error("Missing closing parenthesis in :" + name_3 + " (" + selector + ")");
	              }

	              selector = selector.substr(1);
	            } else {
	              var pos = 1;
	              var counter = 1;

	              for (; counter > 0 && pos < selector.length; pos++) {
	                if (selector.charAt(pos) === "(" && !isEscaped(pos)) counter++;else if (selector.charAt(pos) === ")" && !isEscaped(pos)) counter--;
	              }

	              if (counter) {
	                throw new Error("Parenthesis not matched");
	              }

	              data = selector.substr(1, pos - 2);
	              selector = selector.substr(pos);

	              if (stripQuotesFromPseudos.has(name_3)) {
	                var quot = data.charAt(0);

	                if (quot === data.slice(-1) && quotes.has(quot)) {
	                  data = data.slice(1, -1);
	                }

	                data = unescapeCSS(data);
	              }
	            }
	          }

	          tokens.push({
	            type: "pseudo",
	            name: name_3,
	            data: data
	          });
	        } else if (reName.test(selector)) {
	          var name_4 = getName();

	          if (!options || ("lowerCaseTags" in options ? options.lowerCaseTags : !options.xmlMode)) {
	            name_4 = name_4.toLowerCase();
	          }

	          tokens.push({
	            type: "tag",
	            name: name_4
	          });
	        } else {
	          if (tokens.length && tokens[tokens.length - 1].type === "descendant") {
	            tokens.pop();
	          }

	          addToken(subselects, tokens);
	          return selector;
	        }
	      }
	    }

	    addToken(subselects, tokens);
	    return selector;
	  }

	  function addToken(subselects, tokens) {
	    if (subselects.length > 0 && tokens.length === 0) {
	      throw new Error("Empty sub-selector");
	    }

	    subselects.push(tokens);
	  }
	});

	var stringify_1 = createCommonjsModule(function (module, exports) {

	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	  var actionTypes = {
	    equals: "",
	    element: "~",
	    start: "^",
	    end: "$",
	    any: "*",
	    not: "!",
	    hyphen: "|"
	  };

	  function stringify(token) {
	    return token.map(stringifySubselector).join(", ");
	  }

	  exports.default = stringify;

	  function stringifySubselector(token) {
	    return token.map(stringifyToken).join("");
	  }

	  function stringifyToken(token) {
	    switch (token.type) {
	      // Simple types
	      case "child":
	        return " > ";

	      case "parent":
	        return " < ";

	      case "sibling":
	        return " ~ ";

	      case "adjacent":
	        return " + ";

	      case "descendant":
	        return " ";

	      case "universal":
	        return "*";

	      case "tag":
	        return escapeName(token.name);

	      case "pseudo-element":
	        return "::" + escapeName(token.name);

	      case "pseudo":
	        if (token.data === null) return ":" + escapeName(token.name);

	        if (typeof token.data === "string") {
	          return ":" + escapeName(token.name) + "(" + token.data + ")";
	        }

	        return ":" + escapeName(token.name) + "(" + stringify(token.data) + ")";

	      case "attribute":
	        if (token.action === "exists") {
	          return "[" + escapeName(token.name) + "]";
	        }

	        if (token.name === "id" && token.action === "equals" && !token.ignoreCase) {
	          return "#" + escapeName(token.value);
	        }

	        if (token.name === "class" && token.action === "element" && !token.ignoreCase) {
	          return "." + escapeName(token.value);
	        }

	        return "[" + escapeName(token.name) + actionTypes[token.action] + "='" + escapeName(token.value) + "'" + (token.ignoreCase ? "i" : "") + "]";

	      default:
	        throw new Error("Unknown type");
	    }
	  }

	  function escapeName(str) {
	    //TODO
	    return str;
	  }
	});

	var lib = createCommonjsModule(function (module, exports) {

	  var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function (o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, {
	      enumerable: true,
	      get: function () {
	        return m[k];
	      }
	    });
	  } : function (o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	  });

	  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function (m, exports) {
	    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
	  };

	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });

	  __exportStar(parse_1, exports);

	  var parse_1$1 = parse_1;
	  Object.defineProperty(exports, "parse", {
	    enumerable: true,
	    get: function () {
	      return parse_1$1.default;
	    }
	  });
	  Object.defineProperty(exports, "stringify", {
	    enumerable: true,
	    get: function () {
	      return stringify_1.default;
	    }
	  });
	});

	var universal = 50;
	var tag = 30;
	var attribute = 1;
	var pseudo = 0;
	var descendant = -1;
	var child = -1;
	var parent = -1;
	var sibling = -1;
	var adjacent = -1;
	var procedure = {
		universal: universal,
		tag: tag,
		attribute: attribute,
		pseudo: pseudo,
		descendant: descendant,
		child: child,
		parent: parent,
		sibling: sibling,
		adjacent: adjacent
	};

	var sort = sortByProcedure;
	/*
		sort the parts of the passed selector,
		as there is potential for optimization
		(some types of selectors are faster than others)
	*/

	var attributes = {
	  __proto__: null,
	  exists: 10,
	  equals: 8,
	  not: 7,
	  start: 6,
	  end: 6,
	  any: 5,
	  hyphen: 4,
	  element: 4
	};

	function sortByProcedure(arr) {
	  var procs = arr.map(getProcedure);

	  for (var i = 1; i < arr.length; i++) {
	    var procNew = procs[i];
	    if (procNew < 0) continue;

	    for (var j = i - 1; j >= 0 && procNew < procs[j]; j--) {
	      var token = arr[j + 1];
	      arr[j + 1] = arr[j];
	      arr[j] = token;
	      procs[j + 1] = procs[j];
	      procs[j] = procNew;
	    }
	  }
	}

	function getProcedure(token) {
	  var proc = procedure[token.type];

	  if (proc === procedure.attribute) {
	    proc = attributes[token.action];

	    if (proc === attributes.equals && token.name === "id") {
	      //prefer ID selectors (eg. #ID)
	      proc = 9;
	    }

	    if (token.ignoreCase) {
	      //ignoreCase adds some overhead, prefer "normal" token
	      //this is a binary operation, to ensure it's still an int
	      proc >>= 1;
	    }
	  } else if (proc === procedure.pseudo) {
	    if (!token.data) {
	      proc = 3;
	    } else if (token.name === "has" || token.name === "contains") {
	      proc = 0; //expensive in any case
	    } else if (token.name === "matches" || token.name === "not") {
	      proc = 0;

	      for (var i = 0; i < token.data.length; i++) {
	        //TODO better handling of complex selectors
	        if (token.data[i].length !== 1) continue;
	        var cur = getProcedure(token.data[i][0]); //avoid executing :has or :contains

	        if (cur === 0) {
	          proc = 0;
	          break;
	        }

	        if (cur > proc) proc = cur;
	      }

	      if (token.data.length > 1 && proc > 0) proc -= 1;
	    } else {
	      proc = 1;
	    }
	  }

	  return proc;
	}

	var falseFunc = boolbase.falseFunc; //https://github.com/slevithan/XRegExp/blob/master/src/xregexp.js#L469

	var reChars = /[-[\]{}()*+?.,\\^$|#\s]/g;
	/*
		attribute selectors
	*/

	var attributeRules = {
	  __proto__: null,
	  equals: function (next, data, options) {
	    var name = data.name;
	    var value = data.value;
	    var adapter = options.adapter;

	    if (data.ignoreCase) {
	      value = value.toLowerCase();
	      return function equalsIC(elem) {
	        var attr = adapter.getAttributeValue(elem, name);
	        return attr != null && attr.toLowerCase() === value && next(elem);
	      };
	    }

	    return function equals(elem) {
	      return adapter.getAttributeValue(elem, name) === value && next(elem);
	    };
	  },
	  hyphen: function (next, data, options) {
	    var name = data.name;
	    var value = data.value;
	    var len = value.length;
	    var adapter = options.adapter;

	    if (data.ignoreCase) {
	      value = value.toLowerCase();
	      return function hyphenIC(elem) {
	        var attr = adapter.getAttributeValue(elem, name);
	        return attr != null && (attr.length === len || attr.charAt(len) === "-") && attr.substr(0, len).toLowerCase() === value && next(elem);
	      };
	    }

	    return function hyphen(elem) {
	      var attr = adapter.getAttributeValue(elem, name);
	      return attr != null && attr.substr(0, len) === value && (attr.length === len || attr.charAt(len) === "-") && next(elem);
	    };
	  },
	  element: function (next, data, options) {
	    var name = data.name;
	    var value = data.value;
	    var adapter = options.adapter;

	    if (/\s/.test(value)) {
	      return falseFunc;
	    }

	    value = value.replace(reChars, "\\$&");
	    var pattern = "(?:^|\\s)" + value + "(?:$|\\s)",
	        flags = data.ignoreCase ? "i" : "",
	        regex = new RegExp(pattern, flags);
	    return function element(elem) {
	      var attr = adapter.getAttributeValue(elem, name);
	      return attr != null && regex.test(attr) && next(elem);
	    };
	  },
	  exists: function (next, data, options) {
	    var name = data.name;
	    var adapter = options.adapter;
	    return function exists(elem) {
	      return adapter.hasAttrib(elem, name) && next(elem);
	    };
	  },
	  start: function (next, data, options) {
	    var name = data.name;
	    var value = data.value;
	    var len = value.length;
	    var adapter = options.adapter;

	    if (len === 0) {
	      return falseFunc;
	    }

	    if (data.ignoreCase) {
	      value = value.toLowerCase();
	      return function startIC(elem) {
	        var attr = adapter.getAttributeValue(elem, name);
	        return attr != null && attr.substr(0, len).toLowerCase() === value && next(elem);
	      };
	    }

	    return function start(elem) {
	      var attr = adapter.getAttributeValue(elem, name);
	      return attr != null && attr.substr(0, len) === value && next(elem);
	    };
	  },
	  end: function (next, data, options) {
	    var name = data.name;
	    var value = data.value;
	    var len = -value.length;
	    var adapter = options.adapter;

	    if (len === 0) {
	      return falseFunc;
	    }

	    if (data.ignoreCase) {
	      value = value.toLowerCase();
	      return function endIC(elem) {
	        var attr = adapter.getAttributeValue(elem, name);
	        return attr != null && attr.substr(len).toLowerCase() === value && next(elem);
	      };
	    }

	    return function end(elem) {
	      var attr = adapter.getAttributeValue(elem, name);
	      return attr != null && attr.substr(len) === value && next(elem);
	    };
	  },
	  any: function (next, data, options) {
	    var name = data.name;
	    var value = data.value;
	    var adapter = options.adapter;

	    if (value === "") {
	      return falseFunc;
	    }

	    if (data.ignoreCase) {
	      var regex = new RegExp(value.replace(reChars, "\\$&"), "i");
	      return function anyIC(elem) {
	        var attr = adapter.getAttributeValue(elem, name);
	        return attr != null && regex.test(attr) && next(elem);
	      };
	    }

	    return function any(elem) {
	      var attr = adapter.getAttributeValue(elem, name);
	      return attr != null && attr.indexOf(value) >= 0 && next(elem);
	    };
	  },
	  not: function (next, data, options) {
	    var name = data.name;
	    var value = data.value;
	    var adapter = options.adapter;

	    if (value === "") {
	      return function notEmpty(elem) {
	        return !!adapter.getAttributeValue(elem, name) && next(elem);
	      };
	    } else if (data.ignoreCase) {
	      value = value.toLowerCase();
	      return function notIC(elem) {
	        var attr = adapter.getAttributeValue(elem, name);
	        return attr != null && attr.toLowerCase() !== value && next(elem);
	      };
	    }

	    return function not(elem) {
	      return adapter.getAttributeValue(elem, name) !== value && next(elem);
	    };
	  }
	};
	var attributes$1 = {
	  compile: function (next, data, options) {
	    if (options && options.strict && (data.ignoreCase || data.action === "not")) {
	      throw new Error("Unsupported attribute selector");
	    }

	    return attributeRules[data.action](next, data, options);
	  },
	  rules: attributeRules
	};

	var parse_1$1 = parse; //following http://www.w3.org/TR/css3-selectors/#nth-child-pseudo
	//[ ['-'|'+']? INTEGER? {N} [ S* ['-'|'+'] S* INTEGER ]?

	var re_nthElement = /^([+\-]?\d*n)?\s*(?:([+\-]?)\s*(\d+))?$/;
	/*
		parses a nth-check formula, returns an array of two numbers
	*/

	function parse(formula) {
	  formula = formula.trim().toLowerCase();

	  if (formula === "even") {
	    return [2, 0];
	  } else if (formula === "odd") {
	    return [2, 1];
	  } else {
	    var parsed = formula.match(re_nthElement);

	    if (!parsed) {
	      throw new SyntaxError("n-th rule couldn't be parsed ('" + formula + "')");
	    }

	    var a;

	    if (parsed[1]) {
	      a = parseInt(parsed[1], 10);

	      if (isNaN(a)) {
	        if (parsed[1].charAt(0) === "-") a = -1;else a = 1;
	      }
	    } else a = 0;

	    return [a, parsed[3] ? parseInt((parsed[2] || "") + parsed[3], 10) : 0];
	  }
	}

	var compile_1 = compile;
	var trueFunc = boolbase.trueFunc,
	    falseFunc$1 = boolbase.falseFunc;
	/*
		returns a function that checks if an elements index matches the given rule
		highly optimized to return the fastest solution
	*/

	function compile(parsed) {
	  var a = parsed[0],
	      b = parsed[1] - 1; //when b <= 0, a*n won't be possible for any matches when a < 0
	  //besides, the specification says that no element is matched when a and b are 0

	  if (b < 0 && a <= 0) return falseFunc$1; //when a is in the range -1..1, it matches any element (so only b is checked)

	  if (a === -1) return function (pos) {
	    return pos <= b;
	  };
	  if (a === 0) return function (pos) {
	    return pos === b;
	  }; //when b <= 0 and a === 1, they match any element

	  if (a === 1) return b < 0 ? trueFunc : function (pos) {
	    return pos >= b;
	  }; //when a > 0, modulo can be used to check if there is a match

	  var bMod = b % a;
	  if (bMod < 0) bMod += a;

	  if (a > 1) {
	    return function (pos) {
	      return pos >= b && pos % a === bMod;
	    };
	  }

	  a *= -1; //make `a` positive

	  return function (pos) {
	    return pos <= b && pos % a === bMod;
	  };
	}

	var nthCheck = function nthCheck(formula) {
	  return compile_1(parse_1$1(formula));
	};

	var parse_1$2 = parse_1$1;
	var compile_1$1 = compile_1;
	nthCheck.parse = parse_1$2;
	nthCheck.compile = compile_1$1;

	/*
		pseudo selectors

		---

		they are available in two forms:
		* filters called when the selector
		  is compiled and return a function
		  that needs to return next()
		* pseudos get called on execution
		  they need to return a boolean
	*/

	var trueFunc$1 = boolbase.trueFunc;
	var falseFunc$2 = boolbase.falseFunc;
	var checkAttrib = attributes$1.rules.equals;

	function getAttribFunc(name, value) {
	  var data = {
	    name: name,
	    value: value
	  };
	  return function attribFunc(next, rule, options) {
	    return checkAttrib(next, data, options);
	  };
	}

	function getChildFunc(next, adapter) {
	  return function (elem) {
	    return !!adapter.getParent(elem) && next(elem);
	  };
	}

	var filters = {
	  contains: function (next, text, options) {
	    var adapter = options.adapter;
	    return function contains(elem) {
	      return next(elem) && adapter.getText(elem).indexOf(text) >= 0;
	    };
	  },
	  icontains: function (next, text, options) {
	    var itext = text.toLowerCase();
	    var adapter = options.adapter;
	    return function icontains(elem) {
	      return next(elem) && adapter.getText(elem).toLowerCase().indexOf(itext) >= 0;
	    };
	  },
	  //location specific methods
	  "nth-child": function (next, rule, options) {
	    var func = nthCheck(rule);
	    var adapter = options.adapter;
	    if (func === falseFunc$2) return func;
	    if (func === trueFunc$1) return getChildFunc(next, adapter);
	    return function nthChild(elem) {
	      var siblings = adapter.getSiblings(elem);

	      for (var i = 0, pos = 0; i < siblings.length; i++) {
	        if (adapter.isTag(siblings[i])) {
	          if (siblings[i] === elem) break;else pos++;
	        }
	      }

	      return func(pos) && next(elem);
	    };
	  },
	  "nth-last-child": function (next, rule, options) {
	    var func = nthCheck(rule);
	    var adapter = options.adapter;
	    if (func === falseFunc$2) return func;
	    if (func === trueFunc$1) return getChildFunc(next, adapter);
	    return function nthLastChild(elem) {
	      var siblings = adapter.getSiblings(elem);

	      for (var pos = 0, i = siblings.length - 1; i >= 0; i--) {
	        if (adapter.isTag(siblings[i])) {
	          if (siblings[i] === elem) break;else pos++;
	        }
	      }

	      return func(pos) && next(elem);
	    };
	  },
	  "nth-of-type": function (next, rule, options) {
	    var func = nthCheck(rule);
	    var adapter = options.adapter;
	    if (func === falseFunc$2) return func;
	    if (func === trueFunc$1) return getChildFunc(next, adapter);
	    return function nthOfType(elem) {
	      var siblings = adapter.getSiblings(elem);

	      for (var pos = 0, i = 0; i < siblings.length; i++) {
	        if (adapter.isTag(siblings[i])) {
	          if (siblings[i] === elem) break;
	          if (adapter.getName(siblings[i]) === adapter.getName(elem)) pos++;
	        }
	      }

	      return func(pos) && next(elem);
	    };
	  },
	  "nth-last-of-type": function (next, rule, options) {
	    var func = nthCheck(rule);
	    var adapter = options.adapter;
	    if (func === falseFunc$2) return func;
	    if (func === trueFunc$1) return getChildFunc(next, adapter);
	    return function nthLastOfType(elem) {
	      var siblings = adapter.getSiblings(elem);

	      for (var pos = 0, i = siblings.length - 1; i >= 0; i--) {
	        if (adapter.isTag(siblings[i])) {
	          if (siblings[i] === elem) break;
	          if (adapter.getName(siblings[i]) === adapter.getName(elem)) pos++;
	        }
	      }

	      return func(pos) && next(elem);
	    };
	  },
	  //TODO determine the actual root element
	  root: function (next, rule, options) {
	    var adapter = options.adapter;
	    return function (elem) {
	      return !adapter.getParent(elem) && next(elem);
	    };
	  },
	  scope: function (next, rule, options, context) {
	    var adapter = options.adapter;

	    if (!context || context.length === 0) {
	      //equivalent to :root
	      return filters.root(next, rule, options);
	    }

	    function equals(a, b) {
	      if (typeof adapter.equals === "function") return adapter.equals(a, b);
	      return a === b;
	    }

	    if (context.length === 1) {
	      //NOTE: can't be unpacked, as :has uses this for side-effects
	      return function (elem) {
	        return equals(context[0], elem) && next(elem);
	      };
	    }

	    return function (elem) {
	      return context.indexOf(elem) >= 0 && next(elem);
	    };
	  },
	  //jQuery extensions (others follow as pseudos)
	  checkbox: getAttribFunc("type", "checkbox"),
	  file: getAttribFunc("type", "file"),
	  password: getAttribFunc("type", "password"),
	  radio: getAttribFunc("type", "radio"),
	  reset: getAttribFunc("type", "reset"),
	  image: getAttribFunc("type", "image"),
	  submit: getAttribFunc("type", "submit"),
	  //dynamic state pseudos. These depend on optional Adapter methods.
	  hover: function (next, rule, options) {
	    var adapter = options.adapter;

	    if (typeof adapter.isHovered === 'function') {
	      return function hover(elem) {
	        return next(elem) && adapter.isHovered(elem);
	      };
	    }

	    return falseFunc$2;
	  },
	  visited: function (next, rule, options) {
	    var adapter = options.adapter;

	    if (typeof adapter.isVisited === 'function') {
	      return function visited(elem) {
	        return next(elem) && adapter.isVisited(elem);
	      };
	    }

	    return falseFunc$2;
	  },
	  active: function (next, rule, options) {
	    var adapter = options.adapter;

	    if (typeof adapter.isActive === 'function') {
	      return function active(elem) {
	        return next(elem) && adapter.isActive(elem);
	      };
	    }

	    return falseFunc$2;
	  }
	}; //helper methods

	function getFirstElement(elems, adapter) {
	  for (var i = 0; elems && i < elems.length; i++) {
	    if (adapter.isTag(elems[i])) return elems[i];
	  }
	} //while filters are precompiled, pseudos get called when they are needed


	var pseudos = {
	  empty: function (elem, adapter) {
	    return !adapter.getChildren(elem).some(function (elem) {
	      return adapter.isTag(elem) || elem.type === "text";
	    });
	  },
	  "first-child": function (elem, adapter) {
	    return getFirstElement(adapter.getSiblings(elem), adapter) === elem;
	  },
	  "last-child": function (elem, adapter) {
	    var siblings = adapter.getSiblings(elem);

	    for (var i = siblings.length - 1; i >= 0; i--) {
	      if (siblings[i] === elem) return true;
	      if (adapter.isTag(siblings[i])) break;
	    }

	    return false;
	  },
	  "first-of-type": function (elem, adapter) {
	    var siblings = adapter.getSiblings(elem);

	    for (var i = 0; i < siblings.length; i++) {
	      if (adapter.isTag(siblings[i])) {
	        if (siblings[i] === elem) return true;
	        if (adapter.getName(siblings[i]) === adapter.getName(elem)) break;
	      }
	    }

	    return false;
	  },
	  "last-of-type": function (elem, adapter) {
	    var siblings = adapter.getSiblings(elem);

	    for (var i = siblings.length - 1; i >= 0; i--) {
	      if (adapter.isTag(siblings[i])) {
	        if (siblings[i] === elem) return true;
	        if (adapter.getName(siblings[i]) === adapter.getName(elem)) break;
	      }
	    }

	    return false;
	  },
	  "only-of-type": function (elem, adapter) {
	    var siblings = adapter.getSiblings(elem);

	    for (var i = 0, j = siblings.length; i < j; i++) {
	      if (adapter.isTag(siblings[i])) {
	        if (siblings[i] === elem) continue;

	        if (adapter.getName(siblings[i]) === adapter.getName(elem)) {
	          return false;
	        }
	      }
	    }

	    return true;
	  },
	  "only-child": function (elem, adapter) {
	    var siblings = adapter.getSiblings(elem);

	    for (var i = 0; i < siblings.length; i++) {
	      if (adapter.isTag(siblings[i]) && siblings[i] !== elem) return false;
	    }

	    return true;
	  },
	  //:matches(a, area, link)[href]
	  link: function (elem, adapter) {
	    return adapter.hasAttrib(elem, "href");
	  },
	  //TODO: :any-link once the name is finalized (as an alias of :link)
	  //forms
	  //to consider: :target
	  //:matches([selected], select:not([multiple]):not(> option[selected]) > option:first-of-type)
	  selected: function (elem, adapter) {
	    if (adapter.hasAttrib(elem, "selected")) return true;else if (adapter.getName(elem) !== "option") return false; //the first <option> in a <select> is also selected

	    var parent = adapter.getParent(elem);

	    if (!parent || adapter.getName(parent) !== "select" || adapter.hasAttrib(parent, "multiple")) {
	      return false;
	    }

	    var siblings = adapter.getChildren(parent);
	    var sawElem = false;

	    for (var i = 0; i < siblings.length; i++) {
	      if (adapter.isTag(siblings[i])) {
	        if (siblings[i] === elem) {
	          sawElem = true;
	        } else if (!sawElem) {
	          return false;
	        } else if (adapter.hasAttrib(siblings[i], "selected")) {
	          return false;
	        }
	      }
	    }

	    return sawElem;
	  },
	  //https://html.spec.whatwg.org/multipage/scripting.html#disabled-elements
	  //:matches(
	  //  :matches(button, input, select, textarea, menuitem, optgroup, option)[disabled],
	  //  optgroup[disabled] > option),
	  // fieldset[disabled] * //TODO not child of first <legend>
	  //)
	  disabled: function (elem, adapter) {
	    return adapter.hasAttrib(elem, "disabled");
	  },
	  enabled: function (elem, adapter) {
	    return !adapter.hasAttrib(elem, "disabled");
	  },
	  //:matches(:matches(:radio, :checkbox)[checked], :selected) (TODO menuitem)
	  checked: function (elem, adapter) {
	    return adapter.hasAttrib(elem, "checked") || pseudos.selected(elem, adapter);
	  },
	  //:matches(input, select, textarea)[required]
	  required: function (elem, adapter) {
	    return adapter.hasAttrib(elem, "required");
	  },
	  //:matches(input, select, textarea):not([required])
	  optional: function (elem, adapter) {
	    return !adapter.hasAttrib(elem, "required");
	  },
	  //jQuery extensions
	  //:not(:empty)
	  parent: function (elem, adapter) {
	    return !pseudos.empty(elem, adapter);
	  },
	  //:matches(h1, h2, h3, h4, h5, h6)
	  header: namePseudo(["h1", "h2", "h3", "h4", "h5", "h6"]),
	  //:matches(button, input[type=button])
	  button: function (elem, adapter) {
	    var name = adapter.getName(elem);
	    return name === "button" || name === "input" && adapter.getAttributeValue(elem, "type") === "button";
	  },
	  //:matches(input, textarea, select, button)
	  input: namePseudo(["input", "textarea", "select", "button"]),
	  //input:matches(:not([type!='']), [type='text' i])
	  text: function (elem, adapter) {
	    var attr;
	    return adapter.getName(elem) === "input" && (!(attr = adapter.getAttributeValue(elem, "type")) || attr.toLowerCase() === "text");
	  }
	};

	function namePseudo(names) {
	  if (typeof Set !== "undefined") {
	    // eslint-disable-next-line no-undef
	    var nameSet = new Set(names);
	    return function (elem, adapter) {
	      return nameSet.has(adapter.getName(elem));
	    };
	  }

	  return function (elem, adapter) {
	    return names.indexOf(adapter.getName(elem)) >= 0;
	  };
	}

	function verifyArgs(func, name, subselect) {
	  if (subselect === null) {
	    if (func.length > 2 && name !== "scope") {
	      throw new Error("pseudo-selector :" + name + " requires an argument");
	    }
	  } else {
	    if (func.length === 2) {
	      throw new Error("pseudo-selector :" + name + " doesn't have any arguments");
	    }
	  }
	} //FIXME this feels hacky


	var re_CSS3 = /^(?:(?:nth|last|first|only)-(?:child|of-type)|root|empty|(?:en|dis)abled|checked|not)$/;
	var pseudos_1 = {
	  compile: function (next, data, options, context) {
	    var name = data.name;
	    var subselect = data.data;
	    var adapter = options.adapter;

	    if (options && options.strict && !re_CSS3.test(name)) {
	      throw new Error(":" + name + " isn't part of CSS3");
	    }

	    if (typeof filters[name] === "function") {
	      return filters[name](next, subselect, options, context);
	    } else if (typeof pseudos[name] === "function") {
	      var func = pseudos[name];
	      verifyArgs(func, name, subselect);

	      if (func === falseFunc$2) {
	        return func;
	      }

	      if (next === trueFunc$1) {
	        return function pseudoRoot(elem) {
	          return func(elem, adapter, subselect);
	        };
	      }

	      return function pseudoArgs(elem) {
	        return func(elem, adapter, subselect) && next(elem);
	      };
	    } else {
	      throw new Error("unmatched pseudo-class :" + name);
	    }
	  },
	  filters: filters,
	  pseudos: pseudos
	};

	/*
		all available rules
	*/

	var general = {
	  __proto__: null,
	  attribute: attributes$1.compile,
	  pseudo: pseudos_1.compile,
	  //tags
	  tag: function (next, data, options) {
	    var name = data.name;
	    var adapter = options.adapter;
	    return function tag(elem) {
	      return adapter.getName(elem) === name && next(elem);
	    };
	  },
	  //traversal
	  descendant: function (next, data, options) {
	    // eslint-disable-next-line no-undef
	    var isFalseCache = typeof WeakSet !== "undefined" ? new WeakSet() : null;
	    var adapter = options.adapter;
	    return function descendant(elem) {
	      var found = false;

	      while (!found && (elem = adapter.getParent(elem))) {
	        if (!isFalseCache || !isFalseCache.has(elem)) {
	          found = next(elem);

	          if (!found && isFalseCache) {
	            isFalseCache.add(elem);
	          }
	        }
	      }

	      return found;
	    };
	  },
	  _flexibleDescendant: function (next, data, options) {
	    var adapter = options.adapter; // Include element itself, only used while querying an array

	    return function descendant(elem) {
	      var found = next(elem);

	      while (!found && (elem = adapter.getParent(elem))) {
	        found = next(elem);
	      }

	      return found;
	    };
	  },
	  parent: function (next, data, options) {
	    if (options && options.strict) {
	      throw new Error("Parent selector isn't part of CSS3");
	    }

	    var adapter = options.adapter;
	    return function parent(elem) {
	      return adapter.getChildren(elem).some(test);
	    };

	    function test(elem) {
	      return adapter.isTag(elem) && next(elem);
	    }
	  },
	  child: function (next, data, options) {
	    var adapter = options.adapter;
	    return function child(elem) {
	      var parent = adapter.getParent(elem);
	      return !!parent && next(parent);
	    };
	  },
	  sibling: function (next, data, options) {
	    var adapter = options.adapter;
	    return function sibling(elem) {
	      var siblings = adapter.getSiblings(elem);

	      for (var i = 0; i < siblings.length; i++) {
	        if (adapter.isTag(siblings[i])) {
	          if (siblings[i] === elem) break;
	          if (next(siblings[i])) return true;
	        }
	      }

	      return false;
	    };
	  },
	  adjacent: function (next, data, options) {
	    var adapter = options.adapter;
	    return function adjacent(elem) {
	      var siblings = adapter.getSiblings(elem),
	          lastElement;

	      for (var i = 0; i < siblings.length; i++) {
	        if (adapter.isTag(siblings[i])) {
	          if (siblings[i] === elem) break;
	          lastElement = siblings[i];
	        }
	      }

	      return !!lastElement && next(lastElement);
	    };
	  },
	  universal: function (next) {
	    return next;
	  }
	};

	/*
		compiles a selector to an executable function
	*/

	var compile_1$2 = compile$1;
	var parse$1 = lib.parse;
	var trueFunc$2 = boolbase.trueFunc;
	var falseFunc$3 = boolbase.falseFunc;
	var filters$1 = pseudos_1.filters;

	function compile$1(selector, options, context) {
	  var next = compileUnsafe(selector, options, context);
	  return wrap(next, options);
	}

	function wrap(next, options) {
	  var adapter = options.adapter;
	  return function base(elem) {
	    return adapter.isTag(elem) && next(elem);
	  };
	}

	function compileUnsafe(selector, options, context) {
	  var token = parse$1(selector, options);
	  return compileToken(token, options, context);
	}

	function includesScopePseudo(t) {
	  return t.type === "pseudo" && (t.name === "scope" || Array.isArray(t.data) && t.data.some(function (data) {
	    return data.some(includesScopePseudo);
	  }));
	}

	var DESCENDANT_TOKEN = {
	  type: "descendant"
	};
	var FLEXIBLE_DESCENDANT_TOKEN = {
	  type: "_flexibleDescendant"
	};
	var SCOPE_TOKEN = {
	  type: "pseudo",
	  name: "scope"
	};
	var PLACEHOLDER_ELEMENT = {}; //CSS 4 Spec (Draft): 3.3.1. Absolutizing a Scope-relative Selector
	//http://www.w3.org/TR/selectors4/#absolutizing

	function absolutize(token, options, context) {
	  var adapter = options.adapter; //TODO better check if context is document

	  var hasContext = !!context && !!context.length && context.every(function (e) {
	    return e === PLACEHOLDER_ELEMENT || !!adapter.getParent(e);
	  });
	  token.forEach(function (t) {
	    if (t.length > 0 && isTraversal(t[0]) && t[0].type !== "descendant") ; else if (hasContext && !(Array.isArray(t) ? t.some(includesScopePseudo) : includesScopePseudo(t))) {
	      t.unshift(DESCENDANT_TOKEN);
	    } else {
	      return;
	    }

	    t.unshift(SCOPE_TOKEN);
	  });
	}

	function compileToken(token, options, context) {
	  token = token.filter(function (t) {
	    return t.length > 0;
	  });
	  token.forEach(sort);
	  var isArrayContext = Array.isArray(context);
	  context = options && options.context || context;
	  if (context && !isArrayContext) context = [context];
	  absolutize(token, options, context);
	  var shouldTestNextSiblings = false;
	  var query = token.map(function (rules) {
	    if (rules[0] && rules[1] && rules[0].name === "scope") {
	      var ruleType = rules[1].type;

	      if (isArrayContext && ruleType === "descendant") {
	        rules[1] = FLEXIBLE_DESCENDANT_TOKEN;
	      } else if (ruleType === "adjacent" || ruleType === "sibling") {
	        shouldTestNextSiblings = true;
	      }
	    }

	    return compileRules(rules, options, context);
	  }).reduce(reduceRules, falseFunc$3);
	  query.shouldTestNextSiblings = shouldTestNextSiblings;
	  return query;
	}

	function isTraversal(t) {
	  return procedure[t.type] < 0;
	}

	function compileRules(rules, options, context) {
	  return rules.reduce(function (func, rule) {
	    if (func === falseFunc$3) return func;

	    if (!(rule.type in general)) {
	      throw new Error("Rule type " + rule.type + " is not supported by css-select");
	    }

	    return general[rule.type](func, rule, options, context);
	  }, options && options.rootFunc || trueFunc$2);
	}

	function reduceRules(a, b) {
	  if (b === falseFunc$3 || a === trueFunc$2) {
	    return a;
	  }

	  if (a === falseFunc$3 || b === trueFunc$2) {
	    return b;
	  }

	  return function combine(elem) {
	    return a(elem) || b(elem);
	  };
	}

	function containsTraversal(t) {
	  return t.some(isTraversal);
	} //:not, :has and :matches have to compile selectors
	//doing this in lib/pseudos.js would lead to circular dependencies,
	//so we add them here


	filters$1.not = function (next, token, options, context) {
	  var opts = {
	    xmlMode: !!(options && options.xmlMode),
	    strict: !!(options && options.strict),
	    adapter: options.adapter
	  };

	  if (opts.strict) {
	    if (token.length > 1 || token.some(containsTraversal)) {
	      throw new Error("complex selectors in :not aren't allowed in strict mode");
	    }
	  }

	  var func = compileToken(token, opts, context);
	  if (func === falseFunc$3) return next;
	  if (func === trueFunc$2) return falseFunc$3;
	  return function not(elem) {
	    return !func(elem) && next(elem);
	  };
	};

	filters$1.has = function (next, token, options) {
	  var adapter = options.adapter;
	  var opts = {
	    xmlMode: !!(options && options.xmlMode),
	    strict: !!(options && options.strict),
	    adapter: adapter
	  }; //FIXME: Uses an array as a pointer to the current element (side effects)

	  var context = token.some(containsTraversal) ? [PLACEHOLDER_ELEMENT] : null;
	  var func = compileToken(token, opts, context);
	  if (func === falseFunc$3) return falseFunc$3;

	  if (func === trueFunc$2) {
	    return function hasChild(elem) {
	      return adapter.getChildren(elem).some(adapter.isTag) && next(elem);
	    };
	  }

	  func = wrap(func, options);

	  if (context) {
	    return function has(elem) {
	      return next(elem) && (context[0] = elem, adapter.existsOne(func, adapter.getChildren(elem)));
	    };
	  }

	  return function has(elem) {
	    return next(elem) && adapter.existsOne(func, adapter.getChildren(elem));
	  };
	};

	filters$1.matches = function (next, token, options, context) {
	  var opts = {
	    xmlMode: !!(options && options.xmlMode),
	    strict: !!(options && options.strict),
	    rootFunc: next,
	    adapter: options.adapter
	  };
	  return compileToken(token, opts, context);
	};

	compile$1.compileToken = compileToken;
	compile$1.compileUnsafe = compileUnsafe;
	compile$1.Pseudos = pseudos_1;

	var cssSelect = CSSselect;
	var falseFunc$4 = boolbase.falseFunc;

	function wrapCompile(func) {
	  return function addAdapter(selector, options, context) {
	    options = options || {};
	    options.adapter = options.adapter || DomUtils__default['default'];
	    return func(selector, options, context);
	  };
	}

	var compile$2 = wrapCompile(compile_1$2);
	var compileUnsafe$1 = wrapCompile(compile_1$2.compileUnsafe);

	function getSelectorFunc(searchFunc) {
	  return function select(query, elems, options) {
	    options = options || {};
	    options.adapter = options.adapter || DomUtils__default['default'];

	    if (typeof query !== "function") {
	      query = compileUnsafe$1(query, options, elems);
	    }

	    if (query.shouldTestNextSiblings) {
	      elems = appendNextSiblings(options && options.context || elems, options.adapter);
	    }

	    if (!Array.isArray(elems)) elems = options.adapter.getChildren(elems);else elems = options.adapter.removeSubsets(elems);
	    return searchFunc(query, elems, options);
	  };
	}

	function getNextSiblings(elem, adapter) {
	  var siblings = adapter.getSiblings(elem);
	  if (!Array.isArray(siblings)) return [];
	  siblings = siblings.slice(0);

	  while (siblings.shift() !== elem);

	  return siblings;
	}

	function appendNextSiblings(elems, adapter) {
	  // Order matters because jQuery seems to check the children before the siblings
	  if (!Array.isArray(elems)) elems = [elems];
	  var newElems = elems.slice(0);

	  for (var i = 0, len = elems.length; i < len; i++) {
	    var nextSiblings = getNextSiblings(newElems[i], adapter);
	    newElems.push.apply(newElems, nextSiblings);
	  }

	  return newElems;
	}

	var selectAll = getSelectorFunc(function selectAll(query, elems, options) {
	  return query === falseFunc$4 || !elems || elems.length === 0 ? [] : options.adapter.findAll(query, elems);
	});
	var selectOne = getSelectorFunc(function selectOne(query, elems, options) {
	  return query === falseFunc$4 || !elems || elems.length === 0 ? null : options.adapter.findOne(query, elems);
	});

	function is(elem, query, options) {
	  options = options || {};
	  options.adapter = options.adapter || DomUtils__default['default'];
	  return (typeof query === "function" ? query : compile$2(query, options))(elem);
	}
	/*
		the exported interface
	*/


	function CSSselect(query, elems, options) {
	  return selectAll(query, elems, options);
	}

	CSSselect.compile = compile$2;
	CSSselect.filters = compile_1$2.Pseudos.filters;
	CSSselect.pseudos = compile_1$2.Pseudos.pseudos;
	CSSselect.selectAll = selectAll;
	CSSselect.selectOne = selectOne;
	CSSselect.is = is; //legacy methods (might be removed)

	CSSselect.parse = compile$2;
	CSSselect.iterate = selectAll; //hooks

	CSSselect._compileUnsafe = compileUnsafe$1;
	CSSselect._compileToken = compile_1$2.compileToken;

	const EMPTY_OBJECT = {};

	function isTag(elem) {
	  return elem.nodeType === 1;
	}

	function getChildren(elem) {
	  return elem.childNodes ? Array.prototype.slice.call(elem.childNodes, 0) : [];
	}

	function getParent(elem) {
	  return elem.parentNode;
	}

	function removeSubsets(nodes) {
	  var idx = nodes.length,
	      node,
	      ancestor,
	      replace; // Check if each node (or one of its ancestors) is already contained in the
	  // array.

	  while (--idx > -1) {
	    node = ancestor = nodes[idx]; // Temporarily remove the node under consideration

	    nodes[idx] = null;
	    replace = true;

	    while (ancestor) {
	      if (nodes.indexOf(ancestor) > -1) {
	        replace = false;
	        nodes.splice(idx, 1);
	        break;
	      }

	      ancestor = getParent(ancestor);
	    } // If the node has been found to be unique, re-insert it.


	    if (replace) {
	      nodes[idx] = node;
	    }
	  }

	  return nodes;
	}

	var adapter = {
	  isTag: isTag,
	  existsOne: function (test, elems) {
	    return elems.some(function (elem) {
	      return isTag(elem) ? test(elem) || adapter.existsOne(test, getChildren(elem)) : false;
	    });
	  },
	  getSiblings: function (elem) {
	    var parent = getParent(elem);
	    return parent ? getChildren(parent) : [elem];
	  },
	  getChildren: getChildren,
	  getParent: getParent,
	  getAttributeValue: function (elem, name) {
	    if (elem.attributes && name in elem.attributes) {
	      var attr = elem.attributes[name];
	      return typeof attr === "string" ? attr : attr.value;
	    } else if (name === "class" && elem.classList) {
	      return Array.from(elem.classList).join(" ");
	    }
	  },
	  hasAttrib: function (elem, name) {
	    return name in (elem.attributes || EMPTY_OBJECT);
	  },
	  removeSubsets: removeSubsets,
	  getName: function (elem) {
	    return (elem.tagName || "").toLowerCase();
	  },
	  findOne: function findOne(test, arr) {
	    var elem = null;

	    for (var i = 0, l = arr.length; i < l && !elem; i++) {
	      if (test(arr[i])) {
	        elem = arr[i];
	      } else {
	        var childs = getChildren(arr[i]);

	        if (childs && childs.length > 0) {
	          elem = findOne(test, childs);
	        }
	      }
	    }

	    return elem;
	  },
	  findAll: function findAll(test, elems) {
	    var result = [];

	    for (var i = 0, j = elems.length; i < j; i++) {
	      if (!isTag(elems[i])) continue;
	      if (test(elems[i])) result.push(elems[i]);
	      var childs = getChildren(elems[i]);
	      if (childs) result = result.concat(findAll(test, childs));
	    }

	    return result;
	  },
	  getText: function getText(elem) {
	    if (Array.isArray(elem)) return elem.map(getText).join("");
	    if (isTag(elem)) return getText(getChildren(elem));
	    if (elem.nodeType === 3) return elem.nodeValue;
	    return "";
	  }
	};
	var cssSelectBrowserAdapter = adapter;

	function _typeof(obj) {
	  "@babel/helpers - typeof";

	  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
	    _typeof = function (obj) {
	      return typeof obj;
	    };
	  } else {
	    _typeof = function (obj) {
	      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	    };
	  }

	  return _typeof(obj);
	}

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	function _defineProperty(obj, key, value) {
	  if (key in obj) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }

	  return obj;
	}

	function ownKeys(object, enumerableOnly) {
	  var keys = Object.keys(object);

	  if (Object.getOwnPropertySymbols) {
	    var symbols = Object.getOwnPropertySymbols(object);
	    if (enumerableOnly) symbols = symbols.filter(function (sym) {
	      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
	    });
	    keys.push.apply(keys, symbols);
	  }

	  return keys;
	}

	function _objectSpread2(target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i] != null ? arguments[i] : {};

	    if (i % 2) {
	      ownKeys(Object(source), true).forEach(function (key) {
	        _defineProperty(target, key, source[key]);
	      });
	    } else if (Object.getOwnPropertyDescriptors) {
	      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
	    } else {
	      ownKeys(Object(source)).forEach(function (key) {
	        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
	      });
	    }
	  }

	  return target;
	}

	function _inherits(subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function");
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) _setPrototypeOf(subClass, superClass);
	}

	function _getPrototypeOf(o) {
	  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
	    return o.__proto__ || Object.getPrototypeOf(o);
	  };
	  return _getPrototypeOf(o);
	}

	function _setPrototypeOf(o, p) {
	  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
	    o.__proto__ = p;
	    return o;
	  };

	  return _setPrototypeOf(o, p);
	}

	function _isNativeReflectConstruct() {
	  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
	  if (Reflect.construct.sham) return false;
	  if (typeof Proxy === "function") return true;

	  try {
	    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
	    return true;
	  } catch (e) {
	    return false;
	  }
	}

	function _construct(Parent, args, Class) {
	  if (_isNativeReflectConstruct()) {
	    _construct = Reflect.construct;
	  } else {
	    _construct = function _construct(Parent, args, Class) {
	      var a = [null];
	      a.push.apply(a, args);
	      var Constructor = Function.bind.apply(Parent, a);
	      var instance = new Constructor();
	      if (Class) _setPrototypeOf(instance, Class.prototype);
	      return instance;
	    };
	  }

	  return _construct.apply(null, arguments);
	}

	function _isNativeFunction(fn) {
	  return Function.toString.call(fn).indexOf("[native code]") !== -1;
	}

	function _wrapNativeSuper(Class) {
	  var _cache = typeof Map === "function" ? new Map() : undefined;

	  _wrapNativeSuper = function _wrapNativeSuper(Class) {
	    if (Class === null || !_isNativeFunction(Class)) return Class;

	    if (typeof Class !== "function") {
	      throw new TypeError("Super expression must either be null or a function");
	    }

	    if (typeof _cache !== "undefined") {
	      if (_cache.has(Class)) return _cache.get(Class);

	      _cache.set(Class, Wrapper);
	    }

	    function Wrapper() {
	      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
	    }

	    Wrapper.prototype = Object.create(Class.prototype, {
	      constructor: {
	        value: Wrapper,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	    return _setPrototypeOf(Wrapper, Class);
	  };

	  return _wrapNativeSuper(Class);
	}

	function _assertThisInitialized(self) {
	  if (self === void 0) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return self;
	}

	function _possibleConstructorReturn(self, call) {
	  if (call && (typeof call === "object" || typeof call === "function")) {
	    return call;
	  }

	  return _assertThisInitialized(self);
	}

	function _createSuper(Derived) {
	  var hasNativeReflectConstruct = _isNativeReflectConstruct();

	  return function _createSuperInternal() {
	    var Super = _getPrototypeOf(Derived),
	        result;

	    if (hasNativeReflectConstruct) {
	      var NewTarget = _getPrototypeOf(this).constructor;

	      result = Reflect.construct(Super, arguments, NewTarget);
	    } else {
	      result = Super.apply(this, arguments);
	    }

	    return _possibleConstructorReturn(this, result);
	  };
	}

	function _toConsumableArray(arr) {
	  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
	}

	function _arrayWithoutHoles(arr) {
	  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
	}

	function _iterableToArray(iter) {
	  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
	}

	function _unsupportedIterableToArray(o, minLen) {
	  if (!o) return;
	  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
	  var n = Object.prototype.toString.call(o).slice(8, -1);
	  if (n === "Object" && o.constructor) n = o.constructor.name;
	  if (n === "Map" || n === "Set") return Array.from(o);
	  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}

	function _arrayLikeToArray(arr, len) {
	  if (len == null || len > arr.length) len = arr.length;

	  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

	  return arr2;
	}

	function _nonIterableSpread() {
	  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}

	var ModelError = /*#__PURE__*/function (_Error) {
	  _inherits(ModelError, _Error);

	  var _super = _createSuper(ModelError);

	  function ModelError() {
	    var _this;

	    _classCallCheck(this, ModelError);

	    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    _this = _super.call.apply(_super, [this].concat(args));
	    if (Error.captureStackTrace) Error.captureStackTrace(_assertThisInitialized(_this), ModelError);
	    _this.name = 'ModelError';
	    return _this;
	  }

	  return ModelError;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var UnknownFilterError = /*#__PURE__*/function (_Error2) {
	  _inherits(UnknownFilterError, _Error2);

	  var _super2 = _createSuper(UnknownFilterError);

	  function UnknownFilterError() {
	    var _this2;

	    _classCallCheck(this, UnknownFilterError);

	    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	      args[_key2] = arguments[_key2];
	    }

	    _this2 = _super2.call.apply(_super2, [this].concat(args));
	    if (Error.captureStackTrace) Error.captureStackTrace(_assertThisInitialized(_this2), UnknownFilterError);
	    _this2.name = 'UnknownFilterError';
	    return _this2;
	  }

	  return UnknownFilterError;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	var errors = {
	  ModelError: ModelError,
	  UnknownFilterError: UnknownFilterError
	};

	var nearley = createCommonjsModule(function (module) {
	  (function (root, factory) {
	    if ( module.exports) {
	      module.exports = factory();
	    } else {
	      root.nearley = factory();
	    }
	  })(commonjsGlobal, function () {
	    function Rule(name, symbols, postprocess) {
	      this.id = ++Rule.highestId;
	      this.name = name;
	      this.symbols = symbols; // a list of literal | regex class | nonterminal

	      this.postprocess = postprocess;
	      return this;
	    }

	    Rule.highestId = 0;

	    Rule.prototype.toString = function (withCursorAt) {
	      var symbolSequence = typeof withCursorAt === "undefined" ? this.symbols.map(getSymbolShortDisplay).join(' ') : this.symbols.slice(0, withCursorAt).map(getSymbolShortDisplay).join(' ') + " ● " + this.symbols.slice(withCursorAt).map(getSymbolShortDisplay).join(' ');
	      return this.name + " → " + symbolSequence;
	    }; // a State is a rule at a position from a given starting point in the input stream (reference)


	    function State(rule, dot, reference, wantedBy) {
	      this.rule = rule;
	      this.dot = dot;
	      this.reference = reference;
	      this.data = [];
	      this.wantedBy = wantedBy;
	      this.isComplete = this.dot === rule.symbols.length;
	    }

	    State.prototype.toString = function () {
	      return "{" + this.rule.toString(this.dot) + "}, from: " + (this.reference || 0);
	    };

	    State.prototype.nextState = function (child) {
	      var state = new State(this.rule, this.dot + 1, this.reference, this.wantedBy);
	      state.left = this;
	      state.right = child;

	      if (state.isComplete) {
	        state.data = state.build(); // Having right set here will prevent the right state and its children
	        // form being garbage collected

	        state.right = undefined;
	      }

	      return state;
	    };

	    State.prototype.build = function () {
	      var children = [];
	      var node = this;

	      do {
	        children.push(node.right.data);
	        node = node.left;
	      } while (node.left);

	      children.reverse();
	      return children;
	    };

	    State.prototype.finish = function () {
	      if (this.rule.postprocess) {
	        this.data = this.rule.postprocess(this.data, this.reference, Parser.fail);
	      }
	    };

	    function Column(grammar, index) {
	      this.grammar = grammar;
	      this.index = index;
	      this.states = [];
	      this.wants = {}; // states indexed by the non-terminal they expect

	      this.scannable = []; // list of states that expect a token

	      this.completed = {}; // states that are nullable
	    }

	    Column.prototype.process = function (nextColumn) {
	      var states = this.states;
	      var wants = this.wants;
	      var completed = this.completed;

	      for (var w = 0; w < states.length; w++) {
	        // nb. we push() during iteration
	        var state = states[w];

	        if (state.isComplete) {
	          state.finish();

	          if (state.data !== Parser.fail) {
	            // complete
	            var wantedBy = state.wantedBy;

	            for (var i = wantedBy.length; i--;) {
	              // this line is hot
	              var left = wantedBy[i];
	              this.complete(left, state);
	            } // special-case nullables


	            if (state.reference === this.index) {
	              // make sure future predictors of this rule get completed.
	              var exp = state.rule.name;
	              (this.completed[exp] = this.completed[exp] || []).push(state);
	            }
	          }
	        } else {
	          // queue scannable states
	          var exp = state.rule.symbols[state.dot];

	          if (typeof exp !== 'string') {
	            this.scannable.push(state);
	            continue;
	          } // predict


	          if (wants[exp]) {
	            wants[exp].push(state);

	            if (completed.hasOwnProperty(exp)) {
	              var nulls = completed[exp];

	              for (var i = 0; i < nulls.length; i++) {
	                var right = nulls[i];
	                this.complete(state, right);
	              }
	            }
	          } else {
	            wants[exp] = [state];
	            this.predict(exp);
	          }
	        }
	      }
	    };

	    Column.prototype.predict = function (exp) {
	      var rules = this.grammar.byName[exp] || [];

	      for (var i = 0; i < rules.length; i++) {
	        var r = rules[i];
	        var wantedBy = this.wants[exp];
	        var s = new State(r, 0, this.index, wantedBy);
	        this.states.push(s);
	      }
	    };

	    Column.prototype.complete = function (left, right) {
	      var copy = left.nextState(right);
	      this.states.push(copy);
	    };

	    function Grammar(rules, start) {
	      this.rules = rules;
	      this.start = start || this.rules[0].name;
	      var byName = this.byName = {};
	      this.rules.forEach(function (rule) {
	        if (!byName.hasOwnProperty(rule.name)) {
	          byName[rule.name] = [];
	        }

	        byName[rule.name].push(rule);
	      });
	    } // So we can allow passing (rules, start) directly to Parser for backwards compatibility


	    Grammar.fromCompiled = function (rules, start) {
	      var lexer = rules.Lexer;

	      if (rules.ParserStart) {
	        start = rules.ParserStart;
	        rules = rules.ParserRules;
	      }

	      var rules = rules.map(function (r) {
	        return new Rule(r.name, r.symbols, r.postprocess);
	      });
	      var g = new Grammar(rules, start);
	      g.lexer = lexer; // nb. storing lexer on Grammar is iffy, but unavoidable

	      return g;
	    };

	    function StreamLexer() {
	      this.reset("");
	    }

	    StreamLexer.prototype.reset = function (data, state) {
	      this.buffer = data;
	      this.index = 0;
	      this.line = state ? state.line : 1;
	      this.lastLineBreak = state ? -state.col : 0;
	    };

	    StreamLexer.prototype.next = function () {
	      if (this.index < this.buffer.length) {
	        var ch = this.buffer[this.index++];

	        if (ch === '\n') {
	          this.line += 1;
	          this.lastLineBreak = this.index;
	        }

	        return {
	          value: ch
	        };
	      }
	    };

	    StreamLexer.prototype.save = function () {
	      return {
	        line: this.line,
	        col: this.index - this.lastLineBreak
	      };
	    };

	    StreamLexer.prototype.formatError = function (token, message) {
	      // nb. this gets called after consuming the offending token,
	      // so the culprit is index-1
	      var buffer = this.buffer;

	      if (typeof buffer === 'string') {
	        var lines = buffer.split("\n").slice(Math.max(0, this.line - 5), this.line);
	        var nextLineBreak = buffer.indexOf('\n', this.index);
	        if (nextLineBreak === -1) nextLineBreak = buffer.length;
	        var col = this.index - this.lastLineBreak;
	        var lastLineDigits = String(this.line).length;
	        message += " at line " + this.line + " col " + col + ":\n\n";
	        message += lines.map(function (line, i) {
	          return pad(this.line - lines.length + i + 1, lastLineDigits) + " " + line;
	        }, this).join("\n");
	        message += "\n" + pad("", lastLineDigits + col) + "^\n";
	        return message;
	      } else {
	        return message + " at index " + (this.index - 1);
	      }

	      function pad(n, length) {
	        var s = String(n);
	        return Array(length - s.length + 1).join(" ") + s;
	      }
	    };

	    function Parser(rules, start, options) {
	      if (rules instanceof Grammar) {
	        var grammar = rules;
	        var options = start;
	      } else {
	        var grammar = Grammar.fromCompiled(rules, start);
	      }

	      this.grammar = grammar; // Read options

	      this.options = {
	        keepHistory: false,
	        lexer: grammar.lexer || new StreamLexer()
	      };

	      for (var key in options || {}) {
	        this.options[key] = options[key];
	      } // Setup lexer


	      this.lexer = this.options.lexer;
	      this.lexerState = undefined; // Setup a table

	      var column = new Column(grammar, 0);
	      var table = this.table = [column]; // I could be expecting anything.

	      column.wants[grammar.start] = [];
	      column.predict(grammar.start); // TODO what if start rule is nullable?

	      column.process();
	      this.current = 0; // token index
	    } // create a reserved token for indicating a parse fail


	    Parser.fail = {};

	    Parser.prototype.feed = function (chunk) {
	      var lexer = this.lexer;
	      lexer.reset(chunk, this.lexerState);
	      var token;

	      while (true) {
	        try {
	          token = lexer.next();

	          if (!token) {
	            break;
	          }
	        } catch (e) {
	          // Create the next column so that the error reporter
	          // can display the correctly predicted states.
	          var nextColumn = new Column(this.grammar, this.current + 1);
	          this.table.push(nextColumn);
	          var err = new Error(this.reportLexerError(e));
	          err.offset = this.current;
	          err.token = e.token;
	          throw err;
	        } // We add new states to table[current+1]


	        var column = this.table[this.current]; // GC unused states

	        if (!this.options.keepHistory) {
	          delete this.table[this.current - 1];
	        }

	        var n = this.current + 1;
	        var nextColumn = new Column(this.grammar, n);
	        this.table.push(nextColumn); // Advance all tokens that expect the symbol

	        var literal = token.text !== undefined ? token.text : token.value;
	        var value = lexer.constructor === StreamLexer ? token.value : token;
	        var scannable = column.scannable;

	        for (var w = scannable.length; w--;) {
	          var state = scannable[w];
	          var expect = state.rule.symbols[state.dot]; // Try to consume the token
	          // either regex or literal

	          if (expect.test ? expect.test(value) : expect.type ? expect.type === token.type : expect.literal === literal) {
	            // Add it
	            var next = state.nextState({
	              data: value,
	              token: token,
	              isToken: true,
	              reference: n - 1
	            });
	            nextColumn.states.push(next);
	          }
	        } // Next, for each of the rules, we either
	        // (a) complete it, and try to see if the reference row expected that
	        //     rule
	        // (b) predict the next nonterminal it expects by adding that
	        //     nonterminal's start state
	        // To prevent duplication, we also keep track of rules we have already
	        // added


	        nextColumn.process(); // If needed, throw an error:

	        if (nextColumn.states.length === 0) {
	          // No states at all! This is not good.
	          var err = new Error(this.reportError(token));
	          err.offset = this.current;
	          err.token = token;
	          throw err;
	        } // maybe save lexer state


	        if (this.options.keepHistory) {
	          column.lexerState = lexer.save();
	        }

	        this.current++;
	      }

	      if (column) {
	        this.lexerState = lexer.save();
	      } // Incrementally keep track of results


	      this.results = this.finish(); // Allow chaining, for whatever it's worth

	      return this;
	    };

	    Parser.prototype.reportLexerError = function (lexerError) {
	      var tokenDisplay, lexerMessage; // Planning to add a token property to moo's thrown error
	      // even on erroring tokens to be used in error display below

	      var token = lexerError.token;

	      if (token) {
	        tokenDisplay = "input " + JSON.stringify(token.text[0]) + " (lexer error)";
	        lexerMessage = this.lexer.formatError(token, "Syntax error");
	      } else {
	        tokenDisplay = "input (lexer error)";
	        lexerMessage = lexerError.message;
	      }

	      return this.reportErrorCommon(lexerMessage, tokenDisplay);
	    };

	    Parser.prototype.reportError = function (token) {
	      var tokenDisplay = (token.type ? token.type + " token: " : "") + JSON.stringify(token.value !== undefined ? token.value : token);
	      var lexerMessage = this.lexer.formatError(token, "Syntax error");
	      return this.reportErrorCommon(lexerMessage, tokenDisplay);
	    };

	    Parser.prototype.reportErrorCommon = function (lexerMessage, tokenDisplay) {
	      var lines = [];
	      lines.push(lexerMessage);
	      var lastColumnIndex = this.table.length - 2;
	      var lastColumn = this.table[lastColumnIndex];
	      var expectantStates = lastColumn.states.filter(function (state) {
	        var nextSymbol = state.rule.symbols[state.dot];
	        return nextSymbol && typeof nextSymbol !== "string";
	      });

	      if (expectantStates.length === 0) {
	        lines.push('Unexpected ' + tokenDisplay + '. I did not expect any more input. Here is the state of my parse table:\n');
	        this.displayStateStack(lastColumn.states, lines);
	      } else {
	        lines.push('Unexpected ' + tokenDisplay + '. Instead, I was expecting to see one of the following:\n'); // Display a "state stack" for each expectant state
	        // - which shows you how this state came to be, step by step.
	        // If there is more than one derivation, we only display the first one.

	        var stateStacks = expectantStates.map(function (state) {
	          return this.buildFirstStateStack(state, []) || [state];
	        }, this); // Display each state that is expecting a terminal symbol next.

	        stateStacks.forEach(function (stateStack) {
	          var state = stateStack[0];
	          var nextSymbol = state.rule.symbols[state.dot];
	          var symbolDisplay = this.getSymbolDisplay(nextSymbol);
	          lines.push('A ' + symbolDisplay + ' based on:');
	          this.displayStateStack(stateStack, lines);
	        }, this);
	      }

	      lines.push("");
	      return lines.join("\n");
	    };

	    Parser.prototype.displayStateStack = function (stateStack, lines) {
	      var lastDisplay;
	      var sameDisplayCount = 0;

	      for (var j = 0; j < stateStack.length; j++) {
	        var state = stateStack[j];
	        var display = state.rule.toString(state.dot);

	        if (display === lastDisplay) {
	          sameDisplayCount++;
	        } else {
	          if (sameDisplayCount > 0) {
	            lines.push('    ^ ' + sameDisplayCount + ' more lines identical to this');
	          }

	          sameDisplayCount = 0;
	          lines.push('    ' + display);
	        }

	        lastDisplay = display;
	      }
	    };

	    Parser.prototype.getSymbolDisplay = function (symbol) {
	      return getSymbolLongDisplay(symbol);
	    };
	    /*
	    Builds a the first state stack. You can think of a state stack as the call stack
	    of the recursive-descent parser which the Nearley parse algorithm simulates.
	    A state stack is represented as an array of state objects. Within a
	    state stack, the first item of the array will be the starting
	    state, with each successive item in the array going further back into history.
	     This function needs to be given a starting state and an empty array representing
	    the visited states, and it returns an single state stack.
	     */


	    Parser.prototype.buildFirstStateStack = function (state, visited) {
	      if (visited.indexOf(state) !== -1) {
	        // Found cycle, return null
	        // to eliminate this path from the results, because
	        // we don't know how to display it meaningfully
	        return null;
	      }

	      if (state.wantedBy.length === 0) {
	        return [state];
	      }

	      var prevState = state.wantedBy[0];
	      var childVisited = [state].concat(visited);
	      var childResult = this.buildFirstStateStack(prevState, childVisited);

	      if (childResult === null) {
	        return null;
	      }

	      return [state].concat(childResult);
	    };

	    Parser.prototype.save = function () {
	      var column = this.table[this.current];
	      column.lexerState = this.lexerState;
	      return column;
	    };

	    Parser.prototype.restore = function (column) {
	      var index = column.index;
	      this.current = index;
	      this.table[index] = column;
	      this.table.splice(index + 1);
	      this.lexerState = column.lexerState; // Incrementally keep track of results

	      this.results = this.finish();
	    }; // nb. deprecated: use save/restore instead!


	    Parser.prototype.rewind = function (index) {
	      if (!this.options.keepHistory) {
	        throw new Error('set option `keepHistory` to enable rewinding');
	      } // nb. recall column (table) indicies fall between token indicies.
	      //        col 0   --   token 0   --   col 1


	      this.restore(this.table[index]);
	    };

	    Parser.prototype.finish = function () {
	      // Return the possible parsings
	      var considerations = [];
	      var start = this.grammar.start;
	      var column = this.table[this.table.length - 1];
	      column.states.forEach(function (t) {
	        if (t.rule.name === start && t.dot === t.rule.symbols.length && t.reference === 0 && t.data !== Parser.fail) {
	          considerations.push(t);
	        }
	      });
	      return considerations.map(function (c) {
	        return c.data;
	      });
	    };

	    function getSymbolLongDisplay(symbol) {
	      var type = typeof symbol;

	      if (type === "string") {
	        return symbol;
	      } else if (type === "object") {
	        if (symbol.literal) {
	          return JSON.stringify(symbol.literal);
	        } else if (symbol instanceof RegExp) {
	          return 'character matching ' + symbol;
	        } else if (symbol.type) {
	          return symbol.type + ' token';
	        } else if (symbol.test) {
	          return 'token matching ' + String(symbol.test);
	        } else {
	          throw new Error('Unknown symbol type: ' + symbol);
	        }
	      }
	    }

	    function getSymbolShortDisplay(symbol) {
	      var type = typeof symbol;

	      if (type === "string") {
	        return symbol;
	      } else if (type === "object") {
	        if (symbol.literal) {
	          return JSON.stringify(symbol.literal);
	        } else if (symbol instanceof RegExp) {
	          return symbol.toString();
	        } else if (symbol.type) {
	          return '%' + symbol.type;
	        } else if (symbol.test) {
	          return '<' + String(symbol.test) + '>';
	        } else {
	          throw new Error('Unknown symbol type: ' + symbol);
	        }
	      }
	    }

	    return {
	      Parser: Parser,
	      Grammar: Grammar,
	      Rule: Rule
	    };
	  });
	});

	var grammar = createCommonjsModule(function (module) {
	  // Generated automatically by nearley, version 2.19.6
	  // http://github.com/Hardmath123/nearley
	  (function () {
	    function id(x) {
	      return x[0];
	    }

	    var flatten = function flatten(list) {
	      return list.reduce(function (a, b) {
	        return a.concat(Array.isArray(b) ? flatten(b) : b);
	      }, []);
	    };

	    var prune = function prune(d) {
	      return flatten(d).filter(function (x) {
	        return x !== null;
	      });
	    };

	    var join = function join(d) {
	      return prune(d).join('');
	    };

	    var grammar = {
	      Lexer: undefined,
	      ParserRules: [{
	        "name": "MAIN$ebnf$1",
	        "symbols": ["FILTER_LIST"],
	        "postprocess": id
	      }, {
	        "name": "MAIN$ebnf$1",
	        "symbols": [],
	        "postprocess": function postprocess(d) {
	          return null;
	        }
	      }, {
	        "name": "MAIN",
	        "symbols": ["IDENTIFIER", "_", "MAIN$ebnf$1"],
	        "postprocess": function postprocess(d) {
	          return {
	            getter: d[0],
	            filters: d[2] || []
	          };
	        }
	      }, {
	        "name": "FILTER_LIST",
	        "symbols": ["FILTER"]
	      }, {
	        "name": "FILTER_LIST",
	        "symbols": ["FILTER_LIST", "_", "FILTER"],
	        "postprocess": function postprocess(d) {
	          return flatten([d[0], d[2]]);
	        }
	      }, {
	        "name": "FILTER$ebnf$1",
	        "symbols": []
	      }, {
	        "name": "FILTER$ebnf$1",
	        "symbols": ["FILTER$ebnf$1", "FILTER_ARG"],
	        "postprocess": function arrpush(d) {
	          return d[0].concat([d[1]]);
	        }
	      }, {
	        "name": "FILTER",
	        "symbols": [{
	          "literal": "|"
	        }, "_", "IDENTIFIER", "FILTER$ebnf$1"],
	        "postprocess": function postprocess(d) {
	          return {
	            name: d[2],
	            args: d[3]
	          };
	        }
	      }, {
	        "name": "FILTER_ARG",
	        "symbols": [{
	          "literal": ":"
	        }, "VALUE"],
	        "postprocess": function postprocess(d) {
	          return d[1];
	        }
	      }, {
	        "name": "IDENTIFIER$ebnf$1",
	        "symbols": []
	      }, {
	        "name": "IDENTIFIER$ebnf$1",
	        "symbols": ["IDENTIFIER$ebnf$1", /[a-zA-Z0-9_$]/],
	        "postprocess": function arrpush(d) {
	          return d[0].concat([d[1]]);
	        }
	      }, {
	        "name": "IDENTIFIER",
	        "symbols": ["ID_START", "IDENTIFIER$ebnf$1"],
	        "postprocess": join
	      }, {
	        "name": "ID_START",
	        "symbols": [/[a-zA-Z$_]/],
	        "postprocess": id
	      }, {
	        "name": "VALUE",
	        "symbols": ["NUMBER"],
	        "postprocess": id
	      }, {
	        "name": "VALUE",
	        "symbols": ["STRING"],
	        "postprocess": id
	      }, {
	        "name": "VALUE",
	        "symbols": ["SYMBOL"],
	        "postprocess": id
	      }, {
	        "name": "SYMBOL$ebnf$1",
	        "symbols": [/[a-zA-Z]/]
	      }, {
	        "name": "SYMBOL$ebnf$1",
	        "symbols": ["SYMBOL$ebnf$1", /[a-zA-Z]/],
	        "postprocess": function arrpush(d) {
	          return d[0].concat([d[1]]);
	        }
	      }, {
	        "name": "SYMBOL",
	        "symbols": ["SYMBOL$ebnf$1"],
	        "postprocess": join
	      }, {
	        "name": "NUMBER$ebnf$1",
	        "symbols": [{
	          "literal": "-"
	        }],
	        "postprocess": id
	      }, {
	        "name": "NUMBER$ebnf$1",
	        "symbols": [],
	        "postprocess": function postprocess(d) {
	          return null;
	        }
	      }, {
	        "name": "NUMBER$subexpression$1",
	        "symbols": [{
	          "literal": "0"
	        }]
	      }, {
	        "name": "NUMBER$subexpression$1$ebnf$1",
	        "symbols": []
	      }, {
	        "name": "NUMBER$subexpression$1$ebnf$1",
	        "symbols": ["NUMBER$subexpression$1$ebnf$1", /[0-9]/],
	        "postprocess": function arrpush(d) {
	          return d[0].concat([d[1]]);
	        }
	      }, {
	        "name": "NUMBER$subexpression$1",
	        "symbols": [/[1-9]/, "NUMBER$subexpression$1$ebnf$1"]
	      }, {
	        "name": "NUMBER$ebnf$2$subexpression$1$ebnf$1",
	        "symbols": [/[0-9]/]
	      }, {
	        "name": "NUMBER$ebnf$2$subexpression$1$ebnf$1",
	        "symbols": ["NUMBER$ebnf$2$subexpression$1$ebnf$1", /[0-9]/],
	        "postprocess": function arrpush(d) {
	          return d[0].concat([d[1]]);
	        }
	      }, {
	        "name": "NUMBER$ebnf$2$subexpression$1",
	        "symbols": [{
	          "literal": "."
	        }, "NUMBER$ebnf$2$subexpression$1$ebnf$1"]
	      }, {
	        "name": "NUMBER$ebnf$2",
	        "symbols": ["NUMBER$ebnf$2$subexpression$1"],
	        "postprocess": id
	      }, {
	        "name": "NUMBER$ebnf$2",
	        "symbols": [],
	        "postprocess": function postprocess(d) {
	          return null;
	        }
	      }, {
	        "name": "NUMBER$ebnf$3$subexpression$1$ebnf$1",
	        "symbols": [/[+-]/],
	        "postprocess": id
	      }, {
	        "name": "NUMBER$ebnf$3$subexpression$1$ebnf$1",
	        "symbols": [],
	        "postprocess": function postprocess(d) {
	          return null;
	        }
	      }, {
	        "name": "NUMBER$ebnf$3$subexpression$1$ebnf$2",
	        "symbols": [/[0-9]/]
	      }, {
	        "name": "NUMBER$ebnf$3$subexpression$1$ebnf$2",
	        "symbols": ["NUMBER$ebnf$3$subexpression$1$ebnf$2", /[0-9]/],
	        "postprocess": function arrpush(d) {
	          return d[0].concat([d[1]]);
	        }
	      }, {
	        "name": "NUMBER$ebnf$3$subexpression$1",
	        "symbols": [/[eE]/, "NUMBER$ebnf$3$subexpression$1$ebnf$1", "NUMBER$ebnf$3$subexpression$1$ebnf$2"]
	      }, {
	        "name": "NUMBER$ebnf$3",
	        "symbols": ["NUMBER$ebnf$3$subexpression$1"],
	        "postprocess": id
	      }, {
	        "name": "NUMBER$ebnf$3",
	        "symbols": [],
	        "postprocess": function postprocess(d) {
	          return null;
	        }
	      }, {
	        "name": "NUMBER",
	        "symbols": ["NUMBER$ebnf$1", "NUMBER$subexpression$1", "NUMBER$ebnf$2", "NUMBER$ebnf$3"],
	        "postprocess": function postprocess(d) {
	          return Number.parseFloat(join(d));
	        }
	      }, {
	        "name": "STRING",
	        "symbols": ["SINGLE_QUOTE_STRING"],
	        "postprocess": id
	      }, {
	        "name": "STRING",
	        "symbols": ["DOUBLE_QUOTE_STRING"],
	        "postprocess": id
	      }, {
	        "name": "SINGLE_QUOTE_STRING$ebnf$1",
	        "symbols": []
	      }, {
	        "name": "SINGLE_QUOTE_STRING$ebnf$1",
	        "symbols": ["SINGLE_QUOTE_STRING$ebnf$1", "SINGLE_QUOTE_CHAR"],
	        "postprocess": function arrpush(d) {
	          return d[0].concat([d[1]]);
	        }
	      }, {
	        "name": "SINGLE_QUOTE_STRING",
	        "symbols": [{
	          "literal": "'"
	        }, "SINGLE_QUOTE_STRING$ebnf$1", {
	          "literal": "'"
	        }],
	        "postprocess": function postprocess(d) {
	          return join(d[1]);
	        }
	      }, {
	        "name": "DOUBLE_QUOTE_STRING$ebnf$1",
	        "symbols": []
	      }, {
	        "name": "DOUBLE_QUOTE_STRING$ebnf$1",
	        "symbols": ["DOUBLE_QUOTE_STRING$ebnf$1", "DOUBLE_QUOTE_CHAR"],
	        "postprocess": function arrpush(d) {
	          return d[0].concat([d[1]]);
	        }
	      }, {
	        "name": "DOUBLE_QUOTE_STRING",
	        "symbols": [{
	          "literal": "\""
	        }, "DOUBLE_QUOTE_STRING$ebnf$1", {
	          "literal": "\""
	        }],
	        "postprocess": function postprocess(d) {
	          return join(d[1]);
	        }
	      }, {
	        "name": "SINGLE_QUOTE_CHAR",
	        "symbols": [/[^']/],
	        "postprocess": id
	      }, {
	        "name": "SINGLE_QUOTE_CHAR$string$1",
	        "symbols": [{
	          "literal": "\\"
	        }, {
	          "literal": "'"
	        }],
	        "postprocess": function joiner(d) {
	          return d.join('');
	        }
	      }, {
	        "name": "SINGLE_QUOTE_CHAR",
	        "symbols": ["SINGLE_QUOTE_CHAR$string$1"],
	        "postprocess": function postprocess() {
	          return "'";
	        }
	      }, {
	        "name": "DOUBLE_QUOTE_CHAR",
	        "symbols": [/[^"]/],
	        "postprocess": id
	      }, {
	        "name": "DOUBLE_QUOTE_CHAR$string$1",
	        "symbols": [{
	          "literal": "\\"
	        }, {
	          "literal": "\""
	        }],
	        "postprocess": function joiner(d) {
	          return d.join('');
	        }
	      }, {
	        "name": "DOUBLE_QUOTE_CHAR",
	        "symbols": ["DOUBLE_QUOTE_CHAR$string$1"],
	        "postprocess": function postprocess() {
	          return '"';
	        }
	      }, {
	        "name": "_$ebnf$1",
	        "symbols": []
	      }, {
	        "name": "_$ebnf$1",
	        "symbols": ["_$ebnf$1", "WSCHAR"],
	        "postprocess": function arrpush(d) {
	          return d[0].concat([d[1]]);
	        }
	      }, {
	        "name": "_",
	        "symbols": ["_$ebnf$1"],
	        "postprocess": function postprocess(d) {
	          return d[0] ? ' ' : null;
	        }
	      }, {
	        "name": "WSCHAR",
	        "symbols": [/[ \t\n\v\f]/],
	        "postprocess": join
	      }],
	      ParserStart: "MAIN"
	    };

	    {
	      module.exports = grammar;
	    }
	  })();
	});

	/**
	 * Same as Array.isArray
	 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
	 * @param {*} value The value to be checked.
	 * @returns {boolean} true if the value is an Array; otherwise, false.
	 */
	var isArray = Array.isArray;
	/**
	 * Handy wrapper around Object#hasOwnProperty.
	 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
	 * @param {Object} obj Object to check into.
	 * @param {string} prop Property name to check for.
	 * @returns {boolean} true if obj has the specified prop as own property; otherwise, false.
	 */

	var has = function has(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	};
	/**
	 * Check if the given value is an object; that's it, a non-primitive value.
	 * @param {*} value The value to check.
	 * @returns {boolean} true if the value provided is not a primitive
	 */


	var isObject = function isObject(value) {
	  return Object(value) === value;
	};
	/**
	 * Check is the given argument value is a primitive string.
	 * @param {*} value The value to check.
	 * @returns {boolean} true if the provided value is a primitive string.
	 */


	var isString = function isString(value) {
	  return typeof value === 'string';
	};
	/**
	 * Just a replacement of String#trim to not depend on core-js.
	 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim
	 * @param {string} str String to trim.
	 * @returns {string} Trimmed string.
	 */


	var trim = function trim(str) {
	  return str.replace(/(^\s+)|(\s+$)/g, '');
	};

	var utils = {
	  has: has,
	  isArray: isArray,
	  isObject: isObject,
	  isString: isString,
	  trim: trim
	};

	var trim$1 = utils.trim;
	var compiledGrammar = nearley.Grammar.fromCompiled(grammar); // This matches a pair of parentheses and its content at the end of the string, either at the start
	// of the string or preceded by a whitespace. Examples:
	//   "(whatever content here)"
	//   "irrelevant text (whatever content here)"
	// In both cases, the match will carry the "(whatever content here)" bit, the latter will also
	// have a leading whitespace.

	var queryExtensionPattern = /(?:^|\s)(\(.*\))$/; // This matches the parentheses plus any leading or trailing whitespace matched above, used to clean
	// up the content. In both cases above, if we do a Sting#replace, we end up with the string:
	//   "whatever content here"

	var leadingAndTrailingBoundaries = /(^\s*\(\s*)|(\s*\)\s*$)/g;
	/**
	 * Parse node-scrapy query syntax into handy object
	 * @static
	 * @public
	 * @param  {string} query   Query string
	 * @return {Object}         Parsed query
	 *
	 * @example
	 * const query = '.link (href | trim:both)'
	 *
	 * parseQuery(query)
	 * // => {
	 * //   selector: '.link',
	 * //   getter: 'href',
	 * //   filters: [{ name: 'trim', args: ['both'] }]
	 * // }
	 */

	function parseQuery(query) {
	  var trimmed = trim$1(query);
	  var match = trimmed.match(queryExtensionPattern);

	  if (!match) {
	    return {
	      selector: trimmed,
	      getter: null,
	      filters: []
	    };
	  }

	  var queryExtension = match.find(Boolean);
	  var selector = trim$1(trimmed.slice(0, trimmed.indexOf(queryExtension)));
	  var queryExtensionContent = queryExtension.replace(leadingAndTrailingBoundaries, '');
	  var parser = new nearley.Parser(compiledGrammar);
	  parser.feed(queryExtensionContent); // Return the first result

	  return _objectSpread2({
	    selector: selector
	  }, parser.results.find(Boolean));
	}

	var queryParser = {
	  parseQuery: parseQuery
	};

	var ModelError$1 = errors.ModelError,
	    UnknownFilterError$1 = errors.UnknownFilterError;
	var parseQuery$1 = queryParser.parseQuery;
	var has$1 = utils.has,
	    isArray$1 = utils.isArray,
	    isObject$1 = utils.isObject,
	    isString$1 = utils.isString;
	/**
	 * Given a `dom`, traverse it to get the desired item
	 * @static
	 * @private
	 * @param  {Object} dom DOM node
	 * @param  {(string|Array|Object)} item Data to extract
	 * @param  {Object} selectorEngine Selector engine
	 * @param  {Object} getters A collection of getter functions
	 * @param  {Object} filters A collection of filter functions
	 * @return {string} A string or an array of strings with the extracted data
	 */

	function extractItem(dom, item, selectorEngine, getters, filters) {
	  if (isArray$1(item)) {
	    var queryAST = parseQuery$1(item[0]);
	    var matches = queryAST.selector ? selectorEngine.selectAll(queryAST.selector, dom) : [dom];
	    if (!matches || !matches.length) return null;

	    if (isArray$1(item[1]) || isObject$1(item[1])) {
	      return matches.map(function (context) {
	        return extractItem(context, item[1], selectorEngine, getters, filters);
	      });
	    }

	    return matches.map(function (node) {
	      var data = resolveGetter(getters, queryAST)(node);
	      return applyFilters(filters, queryAST, data);
	    });
	  }

	  if (isObject$1(item)) {
	    return Object.keys(item).reduce(function (acc, key) {
	      acc[key] = extractItem(dom, item[key], selectorEngine, getters, filters);
	      return acc;
	    }, {});
	  }

	  if (isString$1(item)) {
	    var _queryAST = parseQuery$1(item);

	    var match = _queryAST.selector ? selectorEngine.selectOne(_queryAST.selector, dom) : dom;
	    if (!match) return null;
	    var data = resolveGetter(getters, _queryAST)(match);
	    return applyFilters(filters, _queryAST, data);
	  }

	  var unsupportedType = item === null ? 'null' : _typeof(item);
	  throw new ModelError$1("The model has to be a string, an Object or an Array; got ".concat(unsupportedType, " instead."));
	}
	/**
	 * Given a getters collection and a query, decide what getter function to use
	 * @static
	 * @private
	 * @param  {Object} collection Simple collection of getter functions
	 * @param  {Object} query Query object, containing a getter property
	 * @return {Function} A getter function
	 */


	function resolveGetter(collection, query) {
	  // Default to $textContent if no getter was provided in query
	  if (query.getter === null) return collection.$textContent; // Use requested getter function if it is part of the getters collection

	  if (has$1(collection, query.getter)) return collection[query.getter]; // Simply return node attribute if a getter was requested in query
	  // but doesn't exist in the getters collection

	  return function (el) {
	    return collection.attribute(el, query.getter);
	  };
	}
	/**
	 * Given a filters collection, a query object, and data to process, apply all
	 * requested filters by query over the data
	 * @static
	 * @private
	 * @param  {Object} collection Simple collection of filter functions
	 * @param  {Object} query Query object, containing a filters array property
	 * @param  {string} data Data to be transformed
	 * @return {string} Data after all filters have been applied in order
	 */


	function applyFilters(collection, query, data) {
	  // Apply each filter declared in the query, passing the result of the last as
	  // the argument of the next
	  return query.filters.reduce(function (result, filter) {
	    // Check if the requested filter exists in the filters collection
	    if (has$1(collection, filter.name)) {
	      // if so, call it
	      return collection[filter.name].apply(null, [result].concat(_toConsumableArray(filter.args)));
	    } // if not, throw error


	    throw new UnknownFilterError$1("Filter ".concat(filter.name, " does not exist."));
	  }, data);
	}

	var extractItem_1 = {
	  extractItem: extractItem
	};

	/**
	 * Strips excess of whitespace
	 * @static
	 * @public
	 * @param  {string} input String to be normalized
	 * @return {string} Normalized string
	 */
	function normalizeWhitespace(input) {
	  return input.replace(/\s+/g, ' ');
	}
	/**
	 * Prefixes an affix to the input
	 * @static
	 * @public
	 * @param  {string} input Sring to be prefixed
	 * @param  {string} affix Affix to be prefixed
	 * @return {string} Prefixed input
	 */


	function prefix(input, affix) {
	  return affix + input;
	}
	/**
	 * Suffixes an affix to the input
	 * @static
	 * @public
	 * @param  {string} input Sring to be suffixed
	 * @param  {string} affix Affix to be suffixed
	 * @return {string} Suffixed input
	 */


	function suffix(input, affix) {
	  return input + affix;
	}
	/**
	 * Trims leading or trailing whitespace, or both
	 * @static
	 * @public
	 * @param  {string} input String to be trimmed
	 * @param  {string} [side=both] What side to trim
	 * @return {string} Trimed string
	 */


	function trim$2(input) {
	  var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'both';
	  var result = input;

	  if (side === 'both' || side === 'left') {
	    result = result.replace(/^\s*/, '');
	  }

	  if (side === 'both' || side === 'right') {
	    result = result.replace(/\s*$/, '');
	  }

	  return result;
	}

	var filters$2 = {
	  normalizeWhitespace: normalizeWhitespace,
	  prefix: prefix,
	  suffix: suffix,
	  trim: trim$2
	};

	var CSS_SELECT_OPTIONS = Object.freeze({
	  strict: false,
	  xmlMode: false
	});
	var DOMHANDLER_OPTIONS = Object.freeze({
	  normalizeWhitespace: false,
	  withEndIndices: false,
	  withStartIndices: false
	});
	var HTMLPARSER2_OPTIONS = Object.freeze({
	  decodeEntities: true,
	  lowerCaseAttributeNames: true,
	  lowerCaseTags: true,
	  recognizeCDATA: false,
	  recognizeSelfClosing: false,
	  xmlMode: false
	});
	var options = {
	  CSS_SELECT_OPTIONS: CSS_SELECT_OPTIONS,
	  DOMHANDLER_OPTIONS: DOMHANDLER_OPTIONS,
	  HTMLPARSER2_OPTIONS: HTMLPARSER2_OPTIONS
	};

	/**
	 * Get the outer HTML of the given node.
	 * See: https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML
	 * @static
	 * @public
	 * @param {Object} dom DOM Element
	 * @param {string} name The name of the attribute to retrieve.
	 * @returns {string} The string content of the attribute.
	 */
	function getAttribute(dom, name) {
	  if (!dom.hasAttribute(name)) return '';
	  return dom.getAttribute(name);
	}
	/**
	 * Get the outer HTML of the given node.
	 * See: https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML
	 * @static
	 * @public
	 * @param {Object} dom DOM Element
	 * @returns {string} Serialized HTML representation of the element itself and its descendants.
	 */


	function getOuterHTML(dom) {
	  return dom.outerHTML;
	}
	/**
	 * Serialize DOM object into HTML string, excluding the top element
	 * @static
	 * @public
	 * @param  {Object} dom DOM Element
	 * @return {string} Serialized HTML representation of the DOM element's descendants.
	 */


	function getInnerHTML(dom) {
	  return dom.innerHTML;
	}
	/**
	 * Gets all text content of a dom node, just like:
	 * https://developer.mozilla.org/en/docs/Web/API/Node/textContent
	 * @static
	 * @public
	 * @param  {Object} dom DOM Node
	 * @return {string} DOM node's text content
	 */


	function getTextContent(dom) {
	  return dom.textContent;
	}
	/**
	 * Gets concatenated dom's direct child text nodes' data.
	 * @static
	 * @public
	 * @param  {Object} dom DOM Node
	 * @return {string} Concatenation of direct text nodes' content
	 */


	function getTextNodes(dom) {
	  if (dom.nodeType === 3) return dom.data;
	  if (!dom.childNodes) return '';
	  return dom.childNodes.reduce(function (text, nextChild) {
	    return nextChild.nodeType === 3 ? text + nextChild.data : text;
	  }, '');
	}

	var getters = {
	  attribute: getAttribute,
	  $: getTextContent,
	  $innerHTML: getInnerHTML,
	  $outerHTML: getOuterHTML,
	  $textContent: getTextContent,
	  $textNodes: getTextNodes
	};

	// use css-select; since it offers more selectors than the standard specification, we want to
	// also provide it on the browser to keep it consistent.

	var ModelError$2 = errors.ModelError;
	var extractItem$1 = extractItem_1.extractItem;
	var CSS_SELECT_OPTIONS$1 = options.CSS_SELECT_OPTIONS;
	var isString$2 = utils.isString;
	var domParser = new window.DOMParser();
	/**
	 * Given an `html` string, extract data as described in the `model`.
	 * @static
	 * @public
	 * @param  {string} html HTML string to parse
	 * @param  {Object|string} model String or object describing the data to be extracted from the
	 * given HTML
	 * @return {Object}
	 */

	function extract(html, model) {
	  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	  var deserializedModel;

	  try {
	    deserializedModel = JSON.parse(JSON.stringify(model));
	  } catch (error) {
	    throw new ModelError$2("The model cannot be serialized; ".concat(error.message));
	  }

	  var cssSelectOptions = Object.assign({
	    adapter: cssSelectBrowserAdapter
	  }, CSS_SELECT_OPTIONS$1, options.cssSelectOptions);
	  var selectorEngine = {
	    is: function is(elem, query) {
	      return cssSelect.is(elem, query, cssSelectOptions);
	    },
	    selectAll: function selectAll(query, elems) {
	      return cssSelect.selectAll(query, elems, cssSelectOptions);
	    },
	    selectOne: function selectOne(query, elems) {
	      return cssSelect.selectOne(query, elems, cssSelectOptions);
	    }
	  };
	  var parsedHtml = isString$2(html) ? domParser.parseFromString(html, cssSelectOptions.xmlMode ? 'application/xml' : 'text/html') : html;
	  return extractItem$1(parsedHtml, deserializedModel, selectorEngine, getters, filters$2);
	}

	var extract_1 = {
	  extract: extract
	};

	var extract$1 = extract_1.extract;
	var browser = {
	  extract: extract$1
	};

	return browser;

})));
