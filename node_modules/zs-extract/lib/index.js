"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _meta = require("./meta");

Object.keys(_meta).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _meta[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _meta[key];
    }
  });
});

var _extract = require("./extract");

Object.keys(_extract).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _extract[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _extract[key];
    }
  });
});
//# sourceMappingURL=index.js.map
