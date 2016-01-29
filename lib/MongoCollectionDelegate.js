import DocumentModifier from 'marsdb/dist/DocumentModifier';
import { getDb } from './index';
import { selectorIdToObject } from './MongoCursor';
import MongoCursor from './MongoCursor';


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
      const updater = options.multi
          ? this._updateMany.bind(this)
          : this._updateOne.bind(this);
      return updater(queryObject, modifier, coll, options);
    });
  }

  _updateMany(queryObject, modifier, coll, {sort = {_id: 1}}) {
    return coll.find(queryObject).sort(sort).toArray().then((original) => {
      const originalIds = original.map((x) => x._id);
      return coll.updateMany({_id: {$in: originalIds}}, modifier)
      .then((res) => {
        const { updated } = new DocumentModifier(queryObject)
          .modify(original, modifier);
        return {
          modified: original.length,
          updated: updated,
          original: original,
        };
      });
    });
  }

  _updateOne(queryObject, modifier, coll, options) {
    return coll.findOneAndUpdate(queryObject, modifier, options).then((res) => {
      const funcResult = {
        modified: 0,
        original: [],
        updated: [],
      };
      if (res.value) {
        const { updated } = new DocumentModifier(queryObject)
          .modify([res.value], modifier);
        funcResult.modified++;
        funcResult.original.push(res.value);
        funcResult.updated = updated;
      }
      return funcResult;
    });
  }

  find(query, options = {}) {
    return new MongoCursor(this.db, query, options);
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
    return this.find(query).project({_id: 1})
      .map((doc) => doc._id);
  }
}
