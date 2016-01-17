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
    return getDb().then((db) => {
      return db.collection(this.modelName)
        .insert(doc, options);
    }).then((res) => {
      return doc._id;
    });
  }

  remove(query, options = {}) {
    return getDb().then((db) => {
      return db.collection(this.modelName)
        .remove(query, options);
    });
  }

  update(query, modifier, options = {}) {
    return getDb().then((db) => {
      return db.collection(this.modelName)
        .update(query, modifier, options);
    });
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
