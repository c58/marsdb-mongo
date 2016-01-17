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
      const coll = db.collection(this.modelName);
      return coll.insert(doc, options);
    }).then((res) => doc._id);
  }

  remove(query, options = {}) {
    return getDb().then((db) => {
      const coll = db.collection(this.modelName);
      return coll.find(query).toArray().then((docs) => {
        const deleter = options.multi
          ? coll.deleteMany.bind(coll)
          : coll.deleteOne.bind(coll);

        return deleter(query, options).then(() => docs);
      });
    });
  }

  update(query, modifier, options = {}) {
    return getDb().then((db) => {
      const coll = db.collection(this.modelName);
      return coll.find(query).toArray()
        .then((original) => coll.updateMany(query, modifier, options)
          .then((res) => coll.find(query).toArray()
            .then((updated) => ({
              modified: res.modifiedCount,
              original: original,
              updated: updated,
            }))
          )
      );
    });
  }

  find(query, options = {}) {
    return new (this.db.cursorClass)(this.db, query, options);
  }

  findOne(query, options = {}) {
    return this.find(query, options)
      .aggregate(docs => docs[0])
      .limit(1);
  }

  count(query, options = {}) {
    return this.find(query, {...options, fields: {}})
      .aggregate((docs) => docs.length);
  }

  ids(query, options = {}) {
    return this.find(query, {...options, fields: {}})
      .map((doc) => doc._id);
  }
}
