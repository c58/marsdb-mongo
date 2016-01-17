'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDb = getDb;
exports.configure = configure;

var _mongodb = require('mongodb');

var _marsdb = require('marsdb');

var _marsdb2 = _interopRequireDefault(_marsdb);

var _MongoCollectionDelegate = require('./MongoCollectionDelegate');

var _MongoCollectionDelegate2 = _interopRequireDefault(_MongoCollectionDelegate);

var _MongoCursor = require('./MongoCursor');

var _MongoCursor2 = _interopRequireDefault(_MongoCursor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _db = undefined;
function getDb() {
  return _db;
}

function configure(_ref) {
  var url = _ref.url;

  _marsdb2.default.defaultDelegate(_MongoCollectionDelegate2.default);
  _marsdb2.default.defaultCursorClass(_MongoCursor2.default);

  var idGenerator = _marsdb2.default.defaultIdGenerator().bind(null, 'default');
  _db = _mongodb.MongoClient.connect(url, {
    db: { pkFactory: {
        createPk: idGenerator
      } }
  });
}