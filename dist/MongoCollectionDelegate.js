'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _DocumentModifier = require('marsdb/dist/DocumentModifier');

var _DocumentModifier2 = _interopRequireDefault(_DocumentModifier);

var _index = require('./index');

var _MongoCursor = require('./MongoCursor');

var _MongoCursor2 = _interopRequireDefault(_MongoCursor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * CollectionDelegate that uses mongodb driver to
 * insert/update/remove and special MongoCursor for find
 * operations.
 */

var MongoCollectionDelegate = (function () {
  function MongoCollectionDelegate(db) {
    _classCallCheck(this, MongoCollectionDelegate);

    this.db = db;
  }

  _createClass(MongoCollectionDelegate, [{
    key: 'insert',
    value: function insert(doc) {
      var _this = this;

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return (0, _index.getDb)().then(function (db) {
        var coll = db.collection(_this.db.modelName);
        return coll.insert(doc, options);
      }).then(function (res) {
        return doc._id;
      });
    }
  }, {
    key: 'remove',
    value: function remove(query) {
      var _this2 = this;

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var queryObject = (0, _MongoCursor.selectorIdToObject)(query);
      return (0, _index.getDb)().then(function (db) {
        var limit = options.multi ? 0 : 1;
        var coll = db.collection(_this2.db.modelName);
        return coll.find(queryObject).limit(limit).toArray().then(function (docs) {
          var deleter = options.multi ? coll.deleteMany.bind(coll) : coll.deleteOne.bind(coll);

          return deleter(queryObject, options).then(function () {
            return docs;
          });
        });
      });
    }
  }, {
    key: 'update',
    value: function update(query, modifier) {
      var _this3 = this;

      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var queryObject = (0, _MongoCursor.selectorIdToObject)(query);
      return (0, _index.getDb)().then(function (db) {
        var coll = db.collection(_this3.db.modelName);
        var updater = options.multi ? _this3._updateMany.bind(_this3) : _this3._updateOne.bind(_this3);
        return updater(queryObject, modifier, coll, options);
      });
    }
  }, {
    key: '_updateMany',
    value: function _updateMany(queryObject, modifier, coll, _ref) {
      var _ref$sort = _ref.sort;
      var sort = _ref$sort === undefined ? { _id: 1 } : _ref$sort;

      return coll.find(queryObject).sort(sort).toArray().then(function (original) {
        var originalIds = original.map(function (x) {
          return x._id;
        });
        return coll.updateMany({ _id: { $in: originalIds } }, modifier).then(function (res) {
          var _modify = new _DocumentModifier2.default(queryObject).modify(original, modifier);

          var updated = _modify.updated;

          return {
            modified: original.length,
            updated: updated,
            original: original
          };
        });
      });
    }
  }, {
    key: '_updateOne',
    value: function _updateOne(queryObject, modifier, coll, options) {
      return coll.findOneAndUpdate(queryObject, modifier, options).then(function (res) {
        var funcResult = {
          modified: 0,
          original: [],
          updated: []
        };
        if (res.value) {
          var _modify2 = new _DocumentModifier2.default(queryObject).modify([res.value], modifier);

          var updated = _modify2.updated;

          funcResult.modified++;
          funcResult.original.push(res.value);
          funcResult.updated = updated;
        }
        return funcResult;
      });
    }
  }, {
    key: 'find',
    value: function find(query) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new _MongoCursor2.default(this.db, query, options);
    }
  }, {
    key: 'findOne',
    value: function findOne(query) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return this.find(query, options).aggregate(function (docs) {
        return docs[0];
      }).limit(1);
    }
  }, {
    key: 'count',
    value: function count(query) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return this.find(query, _extends({}, options, { count: true }));
    }
  }, {
    key: 'ids',
    value: function ids(query) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return this.find(query).project({ _id: 1 }).map(function (doc) {
        return doc._id;
      });
    }
  }]);

  return MongoCollectionDelegate;
})();

exports.default = MongoCollectionDelegate;