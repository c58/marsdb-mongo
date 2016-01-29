'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDb = getDb;
exports.configure = configure;

var _mongodb = require('mongodb');

var _marsdb = require('marsdb');

var _marsdb2 = _interopRequireDefault(_marsdb);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _MongoCollectionDelegate = require('./MongoCollectionDelegate');

var _MongoCollectionDelegate2 = _interopRequireDefault(_MongoCollectionDelegate);

var _MongoIndexManager = require('./MongoIndexManager');

var _MongoIndexManager2 = _interopRequireDefault(_MongoIndexManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// internal
var _db = undefined;
var _idGenerator = _marsdb2.default.defaultIdGenerator().bind(null, 'default');

/**
 * Return Promise with current DB connection
 * @return {Promise}
 */
function getDb() {
  return _db;
}

/**
 * Create a connection to the MongoDB and setup
 * MarsDB to work with this database
 * @param  {String} options.url
 * @return {Promise}
 */
function configure(_ref) {
  var url = _ref.url;

  _marsdb2.default.defaultDelegate(_MongoCollectionDelegate2.default);
  _marsdb2.default.defaultIndexManager(_MongoIndexManager2.default);

  (0, _invariant2.default)(_db === undefined, 'configure(...): database is already configured');

  _db = _mongodb.MongoClient.connect(url, {
    db: { pkFactory: {
        createPk: _idGenerator
      } }
  });

  return _db;
}