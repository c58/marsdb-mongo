'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('./index');

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
        return db.collection(_this.modelName).insert(doc, options);
      }).then(function (res) {
        return doc._id;
      });
    }
  }, {
    key: 'remove',
    value: function remove(query) {
      var _this2 = this;

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return (0, _index.getDb)().then(function (db) {
        return db.find(query).toArray().then(function (docs) {
          return db.collection(_this2.modelName).deleteMany(query, options).then(function () {
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

      return (0, _index.getDb)().then(function (db) {
        return db.find(query).toArray().then(function (original) {
          return db.collection(_this3.modelName).updateMany(query, modifier, options).then(function (res) {
            return db.find(query).toArray().then(function (updated) {
              return {
                modified: res.modifiedCount,
                original: original,
                updated: updated
              };
            });
          });
        });
      });
    }
  }, {
    key: 'find',
    value: function find(query) {
      // TODO

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    }
  }, {
    key: 'findOne',
    value: function findOne(query, sortObj) {
      // TODO

      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
    }
  }, {
    key: 'count',
    value: function count(query) {
      // TODO

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    }
  }, {
    key: 'ids',
    value: function ids(query) {
      // TODO

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    }
  }]);

  return MongoCollectionDelegate;
})();

exports.default = MongoCollectionDelegate;