'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectorIdToObject = selectorIdToObject;

var _checkTypes = require('check-types');

var _checkTypes2 = _interopRequireDefault(_checkTypes);

var _forEach = require('fast.js/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _marsdb = require('marsdb');

var _index = require('./index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * By given primitive or object returns an object
 * for selecting a document by id
 * @param  {Number|String} query
 * @return {Object}
 */
function selectorIdToObject(query) {
  if (query === undefined) {
    return {};
  } else {
    return !_checkTypes2.default.object(query) ? { _id: query } : query;
  }
}

/**
 * Wrapper around of native mongodb cursor, based
 * on marsdb observable cursor.
 */

var MongoCursor = (function (_CursorObservable) {
  _inherits(MongoCursor, _CursorObservable);

  function MongoCursor(db, query, options) {
    _classCallCheck(this, MongoCursor);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(MongoCursor).call(this, db, selectorIdToObject(query), options));
  }

  _createClass(MongoCursor, [{
    key: 'find',
    value: function find(query) {
      var queryObject = selectorIdToObject(query);
      return _get(Object.getPrototypeOf(MongoCursor.prototype), 'find', this).call(this, queryObject);
    }
  }, {
    key: 'sort',
    value: function sort(objOrArr) {
      var _this2 = this;

      _get(Object.getPrototypeOf(MongoCursor.prototype), 'sort', this).call(this, objOrArr);
      if (this._sorter) {
        this._sort = [];
        (0, _forEach2.default)(this._sorter._sortSpecParts, function (v) {
          _this2._sort.push([v.path, v.ascending ? 'asc' : 'desc']);
        });
      }
      return this;
    }
  }, {
    key: 'exec',
    value: function exec() {
      var _this3 = this;

      if (!this._executing) {
        this._executing = (0, _index.getDb)().then(function (db) {
          var coll = db.collection(_this3.db.modelName);
          var nativeCursor = coll.find(_this3._query);

          if (_this3._skip !== undefined) {
            nativeCursor.skip(_this3._skip);
          }
          if (_this3._limit !== undefined) {
            nativeCursor.limit(_this3._limit);
          }
          if (_this3._sort) {
            nativeCursor.sort(_this3._sort);
          }
          if (_this3._projector) {
            nativeCursor.project(_this3._projector.fields);
          }

          if (_this3.options.count) {
            return nativeCursor.count();
          } else {
            return nativeCursor.toArray();
          }
        }).then(function (docs) {
          return _this3.processPipeline(docs);
        }).then(function (docs) {
          _this3._executing = null;
          return docs;
        });
      }

      return this._executing;
    }
  }, {
    key: '_matchObjects',
    value: function _matchObjects() {
      // do nothing
    }
  }]);

  return MongoCursor;
})(_marsdb.CursorObservable);

exports.default = MongoCursor;