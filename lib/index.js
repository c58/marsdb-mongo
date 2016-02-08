import { MongoClient } from 'mongodb';
import Collection from 'marsdb';
import invariant from 'invariant';
import Delegate from './MongoCollectionDelegate';
import IndexManager from './MongoIndexManager';
import { createCursor } from './MongoCursor';


// internal
let _db;
const _idGenerator = Collection.defaultIdGenerator()
  .bind(null, 'default');

/**
 * Return Promise with current DB connection
 * @return {Promise}
 */
export function getDb() {
  return _db;
}

/**
 * Create a connection to the MongoDB and setup
 * MarsDB to work with this database
 * @param  {String} options.url
 * @param  {Object} options.options
 * @return {Promise}
 */
export function configure({ url, options = {} }) {
  Collection.defaultDelegate(Delegate);
  Collection.defaultIndexManager(IndexManager);
  Collection.defaultCursor(createCursor());

  invariant(
    _db === undefined,
    'configure(...): database is already configured'
  );

  _db = MongoClient.connect(url, {
    db: {pkFactory: { createPk: _idGenerator }},
    server: {
      socketOptions: { autoReconnect: true },
      reconnectTries: Infinity,
      reconnectInterval: 2500,
    },
    ...options
  });

  return _db;
}
