'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _marsdb = require('marsdb');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MongoCursor = (function (_CursorObservable) {
  _inherits(MongoCursor, _CursorObservable);

  function MongoCursor(db, query, options) {
    _classCallCheck(this, MongoCursor);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(MongoCursor).call(this, db, query, options));
  }

  return MongoCursor;
})(_marsdb.CursorObservable);

exports.default = MongoCursor;