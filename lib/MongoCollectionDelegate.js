import { getDb } from './index';


/**
 * CollectionDelegate that uses mongodb driver to
 * insert/update/remove and special MongoCursor for find
 * operations.
 */
export default class MongoCollectionDelegate {
  constructor(db) {
    this.db = db;
  }

  insert(doc, options = {}) {
    return getDb().then((db) => (
      db.collection(this.modelName).insert(doc, options)
    )).then((res) => doc._id);
  }

  remove(query, options = {}) {
    return getDb().then((db) =>
      db.find(query).toArray().then((docs) =>
        db.collection(this.modelName)
          .deleteMany(query, options)
          .then(() => docs)
      )
    );
  }

  update(query, modifier, options = {}) {
    return getDb().then((db) =>
      db.find(query).toArray().then((original) =>
        db.collection(this.modelName)
          .updateMany(query, modifier, options)
          .then((res) =>
            db.find(query).toArray().then((updated) => ({
              modified: res.modifiedCount,
              original: original,
              updated: updated,
            }))
          )
      )
    );
  }

  find(query, options = {}) {
    // TODO
  }

  findOne(query, sortObj, options = {}) {
    // TODO
  }

  count(query, options = {}) {
    // TODO
  }

  ids(query, options = {}) {
    // TODO
  }
}
