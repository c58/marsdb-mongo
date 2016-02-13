'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports._updateLocally = _updateLocally;
exports._updateMany = _updateMany;
exports._updateOne = _updateOne;
exports._prepareModifierForUpsert = _prepareModifierForUpsert;
exports.createCollectionDelegate = createCollectionDelegate;

var _assign2 = require('fast.js/object/assign');

var _assign3 = _interopRequireDefault(_assign2);

var _DocumentModifier = require('marsdb/dist/DocumentModifier');

var _DocumentModifier2 = _interopRequireDefault(_DocumentModifier);

var _marsdb = require('marsdb');

var _index = require('./index');

var _Document = require('marsdb/dist/Document');

var _MongoCursor = require('./MongoCursor');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Internal utils
function _updateLocally(dbDocs, query, modifier, upsert) {
  var docModer = new _DocumentModifier2.default(query);

  var _docModer$modify = docModer.modify(dbDocs, modifier, { upsert: upsert });

  var original = _docModer$modify.original;
  var updated = _docModer$modify.updated;

  var modified = updated.length;
  return { modified: modified, updated: updated, original: original };
}

function _updateMany(query, modifier, coll, _ref) {
  var sort = _ref.sort;
  var upsert = _ref.upsert;

  return coll.find(query).sort(sort).toArray().then(function (dbDocs) {
    var originalIds = dbDocs.map(function (x) {
      return x._id;
    });
    return coll.updateMany({ _id: { $in: originalIds } }, modifier, { upsert: upsert }).then(function (res) {
      return _updateLocally(dbDocs, query, modifier, upsert);
    });
  });
}

function _updateOne(query) {
  var modifier = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var coll = arguments[2];
  var _ref2 = arguments[3];
  var sort = _ref2.sort;
  var upsert = _ref2.upsert;

  return coll.findOneAndUpdate(query, modifier, { upsert: upsert, sort: sort }).then(function (res) {
    var updDocs = res.value ? [res.value] : [];
    return _updateLocally(updDocs, query, modifier, upsert);
  });
}

function _prepareModifierForUpsert(modifier, query) {
  if (!(0, _Document.isOperatorObject)(modifier)) {
    throw new Error('Upsert with replace update is not supported!');
  } else if (!query._id || !(0, _Document.selectorIsId)(query._id)) {
    modifier = (0, _assign3.default)({}, modifier);
    modifier.$setOnInsert = modifier.$setOnInsert || {};
    modifier.$setOnInsert._id = modifier.$setOnInsert._id || _marsdb.Random.default().id();
  }
  return modifier;
}

/**
 * Returns MongoCollectionDelegate based on current default
 * collection delegate
 * @return {CollectionDelegate}
 */
function createCollectionDelegate() {
  var _defaultDelegate = _marsdb.Collection.defaultDelegate();

  /**
   * CollectionDelegate that uses mongodb driver to
   * insert/update/remove and special MongoCursor for find
   * operations.
   */

  var MongoCollectionDelegate = function (_defaultDelegate2) {
    _inherits(MongoCollectionDelegate, _defaultDelegate2);

    function MongoCollectionDelegate() {
      _classCallCheck(this, MongoCollectionDelegate);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(MongoCollectionDelegate).apply(this, arguments));
    }

    _createClass(MongoCollectionDelegate, [{
      key: 'insert',
      value: function insert(doc) {
        var _this2 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        return (0, _index.getDb)().then(function (db) {
          var coll = db.collection(_this2.db.modelName);
          return coll.insert(doc, options);
        }).then(function (res) {
          return doc._id;
        });
      }
    }, {
      key: 'remove',
      value: function remove(query) {
        var _this3 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var queryObject = (0, _MongoCursor.selectorIdToObject)(query);
        return (0, _index.getDb)().then(function (db) {
          var limit = options.multi ? 0 : 1;
          var coll = db.collection(_this3.db.modelName);
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
      value: function update(query, modifier, _ref3) {
        var _this4 = this;

        var _ref3$sort = _ref3.sort;
        var sort = _ref3$sort === undefined ? { _id: 1 } : _ref3$sort;
        var _ref3$upsert = _ref3.upsert;
        var upsert = _ref3$upsert === undefined ? false : _ref3$upsert;
        var _ref3$multi = _ref3.multi;
        var multi = _ref3$multi === undefined ? false : _ref3$multi;

        var queryObject = (0, _MongoCursor.selectorIdToObject)(query);
        var preparedModifier = upsert ? _prepareModifierForUpsert(modifier, queryObject) : modifier;

        return (0, _index.getDb)().then(function (db) {
          var coll = db.collection(_this4.db.modelName);
          var updater = multi ? _updateMany : _updateOne;
          return updater(queryObject, preparedModifier, coll, { sort: sort, upsert: upsert });
        });
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
  }(_defaultDelegate);

  return MongoCollectionDelegate;
}