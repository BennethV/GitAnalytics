(function () { function r (e, n, t) { function o (i, f) { if (!n[i]) { if (!e[i]) { var c = typeof require === 'function' && require; if (!f && c) return c(i, !0); if (u) return u(i, !0); var a = new Error("Cannot find module '" + i + "'"); throw a.code = 'MODULE_NOT_FOUND', a } var p = n[i] = {exports: {}}; e[i][0].call(p.exports, function (r) { var n = e[i][1][r]; return o(n || r) }, p, p.exports, r, e, n, t) } return n[i].exports } for (var u = typeof require === 'function' && require, i = 0; i < t.length; i++)o(t[i]); return o } return r })()({1: [function (require, module, exports) {
  'use strict'

  module.exports = exports = self.fetch

  // Needed for TypeScript and Webpack.
  exports.default = self.fetch.bind(self)

  exports.Headers = self.Headers
  exports.Request = self.Request
  exports.Response = self.Response
}, {}],
2: [function (require, module, exports) {
  (function () { function r (e, n, t) { function o (i, f) { if (!n[i]) { if (!e[i]) { var c = typeof require === 'function' && require; if (!f && c) return c(i, !0); if (u) return u(i, !0); var a = new Error("Cannot find module '" + i + "'"); throw a.code = 'MODULE_NOT_FOUND', a } var p = n[i] = {exports: {}}; e[i][0].call(p.exports, function (r) { var n = e[i][1][r]; return o(n || r) }, p, p.exports, r, e, n, t) } return n[i].exports } for (var u = typeof require === 'function' && require, i = 0; i < t.length; i++)o(t[i]); return o } return r })()({1: [function (require, module, exports) {
    'use strict'

    module.exports = exports = self.fetch

    // Needed for TypeScript and Webpack.
    exports.default = self.fetch.bind(self)

    exports.Headers = self.Headers
    exports.Request = self.Request
    exports.Response = self.Response
  }, {}],
  2: [function (require, module, exports) {
    (function () { function r (e, n, t) { function o (i, f) { if (!n[i]) { if (!e[i]) { var c = typeof require === 'function' && require; if (!f && c) return c(i, !0); if (u) return u(i, !0); var a = new Error("Cannot find module '" + i + "'"); throw a.code = 'MODULE_NOT_FOUND', a } var p = n[i] = {exports: {}}; e[i][0].call(p.exports, function (r) { var n = e[i][1][r]; return o(n || r) }, p, p.exports, r, e, n, t) } return n[i].exports } for (var u = typeof require === 'function' && require, i = 0; i < t.length; i++)o(t[i]); return o } return r })()({1: [function (require, module, exports) {
      'use strict'

      module.exports = exports = self.fetch

      // Needed for TypeScript and Webpack.
      exports.default = self.fetch.bind(self)

      exports.Headers = self.Headers
      exports.Request = self.Request
      exports.Response = self.Response
    }, {}],
    2: [function (require, module, exports) {
      let fetch = require('node-fetch')
      exports.statistics = function () {
    	console.log('Im here ')
      }
    }, {'node-fetch': 1}]}, {}, [2])
  }, {'node-fetch': 1}]}, {}, [2])
}, {'node-fetch': 1}]}, {}, [2])
