'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getDb = getDb;
exports.configure = configure;

var _mongodb = require('mongodb');

var _marsdb = require('marsdb');

var _marsdb2 = _interopRequireDefault(_marsdb);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _MongoIndexManager = require('./MongoIndexManager');

var _MongoIndexManager2 = _interopRequireDefault(_MongoIndexManager);

var _MongoCollectionDelegate = require('./MongoCollectionDelegate');

var _MongoCursor = require('./MongoCursor');

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
 * @param  {Object} options.options
 * @return {Promise}
 */
function configure(_ref) {
  var url = _ref.url;
  var _ref$options = _ref.options;
  var options = _ref$options === undefined ? {} : _ref$options;

  _marsdb2.default.defaultIndexManager(_MongoIndexManager2.default);
  _marsdb2.default.defaultDelegate((0, _MongoCollectionDelegate.createCollectionDelegate)());
  _marsdb2.default.defaultCursor((0, _MongoCursor.createCursor)());

  (0, _invariant2.default)(_db === undefined, 'configure(...): database is already configured');

  _db = _mongodb.MongoClient.connect(url, _extends({
    db: { pkFactory: { createPk: _idGenerator } },
    server: {
      socketOptions: { autoReconnect: true },
      reconnectTries: Infinity,
      reconnectInterval: 2500
    }
  }, options));

  return _db;
}