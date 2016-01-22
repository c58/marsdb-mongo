import _check from 'check-types';
import { selectorIsId } from 'marsdb/dist/Document';
import { CursorObservable } from 'marsdb';
import { getDb } from './index';


/**
 * By given primitive or object returns an object
 * for selecting a document by id
 * @param  {Number|String} query
 * @return {Object}
 */
export function selectorIdToObject(query) {
  if (query === undefined) {
    return {};
  } else {
    return !_check.object(query) ? {_id: query} : query;
  }
};

/**
 * Wrapper around of native mongodb cursor, based
 * on marsdb observable cursor.
 */
export default class MongoCursor extends CursorObservable {
  constructor(db, query, options) {
    super(db, selectorIdToObject(query), options);
  }

  find(query) {
    const queryObject = selectorIdToObject(query);
    return super.find(queryObject);
  }

  exec() {
    if (!this._executing) {
      this._executing = getDb()
      .then(db => {
        const coll = db.collection(this.db.modelName);
        const nativeCursor = coll.find(this._query);

        if (this._skip !== undefined) {
          nativeCursor.skip(this._skip);
        }
        if (this._limit !== undefined) {
          nativeCursor.limit(this._limit);
        }
        if (this._sort) {
          nativeCursor.sort(this._sort);
        }
        if (this._projector) {
          nativeCursor.project(this._projector.fields);
        }

        if (this.options.count) {
          return nativeCursor.count();
        } else {
          return nativeCursor.toArray();
        }
      })
      .then(docs => this.processPipeline(docs))
      .then(docs => {
        this._executing = null;
        return docs;
      });
    }

    return this._executing;
  }

  _matchObjects() {
    // do nothing
  }
}
