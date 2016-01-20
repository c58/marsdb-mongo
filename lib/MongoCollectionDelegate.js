import { getDb } from './index';
import { selectorIdToObject } from './MongoCursor';


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
      const coll = db.collection(this.db.modelName);
      return coll.insert(doc, options);
    }).then((res) => doc._id);
  }

  remove(query, options = {}) {
    const queryObject = selectorIdToObject(query);
    return getDb().then((db) => {
      const limit = options.multi ? 0 : 1;
      const coll = db.collection(this.db.modelName);
      return coll.find(queryObject).limit(limit).toArray().then((docs) => {
        const deleter = options.multi
          ? coll.deleteMany.bind(coll)
          : coll.deleteOne.bind(coll);

        return deleter(queryObject, options).then(() => docs);
      });
    });
  }

  update(query, modifier, options = {}) {
    const queryObject = selectorIdToObject(query);
    return getDb().then((db) => {
      const coll = db.collection(this.db.modelName);
      return coll.find(queryObject).toArray()
        .then((original) =>  {
          const originalIds = original.map(x => x._id);
          const updater = options.multi
            ? coll.updateMany.bind(coll)
            : coll.updateOne.bind(coll);

          return updater(queryObject, modifier, options)
          .then((res) => coll.find({_id: {$in: originalIds}}).toArray()
            .then((updated) => ({
              modified: res.modifiedCount,
              original: original,
              updated: updated,
            }))
          )
        }
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
    return this.find(query, {...options, count: true});
  }

  ids(query, options = {}) {
    return this.find(query, {...options, fields: {}})
      .map((doc) => doc._id);
  }
}
