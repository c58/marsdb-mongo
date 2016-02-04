import _assign from 'fast.js/object/assign';
import DocumentModifier from 'marsdb/dist/DocumentModifier';
import { Collection, Random } from 'marsdb';
import { getDb } from './index';
import { isOperatorObject, selectorIsId } from 'marsdb/dist/Document';
import { selectorIdToObject } from './MongoCursor';


// Internal utils
export function _updateLocally(dbDocs, query, modifier, upsert) {
  const docModer = new DocumentModifier(query);
  const { original, updated } =
    docModer.modify(dbDocs, modifier, { upsert });
  const modified = updated.length;
  return { modified, updated, original };
}

export function _updateMany(query, modifier, coll, { sort, upsert }) {
  return coll.find(query).sort(sort).toArray().then((dbDocs) => {
    const originalIds = dbDocs.map((x) => x._id);
    return coll.updateMany({_id: {$in: originalIds}}, modifier, { upsert })
      .then((res) => _updateLocally(dbDocs, query, modifier, upsert));
  });
}

export function _updateOne(query, modifier = {}, coll, { sort, upsert }) {
  return coll.findOneAndUpdate(query, modifier, { upsert, sort })
    .then((res) => {
      const updDocs = res.value ? [res.value] : [];
      return _updateLocally(updDocs, query, modifier, upsert);
    });
}

export function _prepareModifierForUpsert(modifier, query) {
  if (!isOperatorObject(modifier)) {
    throw new Error('Upsert with replace update is not supported!');
  } else if (!query._id || !selectorIsId(query._id)) {
    modifier = _assign({}, modifier);
    modifier.$setOnInsert = modifier.$setOnInsert || {};
    modifier.$setOnInsert._id =
      modifier.$setOnInsert._id || Random.default().id();
  }
  return modifier;
}


/**
 * Returns MongoCollectionDelegate based on current default
 * collection delegate
 * @return {CollectionDelegate}
 */
export function createCollectionDelegate() {
  const _defaultDelegate = Collection.defaultDelegate();

  /**
   * CollectionDelegate that uses mongodb driver to
   * insert/update/remove and special MongoCursor for find
   * operations.
   */
  class MongoCollectionDelegate extends _defaultDelegate {

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

    update(query, modifier, {sort = {_id: 1}, upsert = false, multi = false}) {
      const queryObject = selectorIdToObject(query);
      const preparedModifier = upsert
        ? _prepareModifierForUpsert(modifier, queryObject)
        : modifier;

      return getDb().then((db) => {
        const coll = db.collection(this.db.modelName);
        const updater = multi ? _updateMany : _updateOne;
        return updater(queryObject, preparedModifier, coll, { sort, upsert });
      });
    }

    count(query, options = {}) {
      return this.find(query, {...options, count: true});
    }

    ids(query, options = {}) {
      return this.find(query).project({_id: 1})
        .map((doc) => doc._id);
    }
  }

  return MongoCollectionDelegate;
}
