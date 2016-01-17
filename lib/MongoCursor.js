import { CursorObservable } from 'marsdb';
import { getDb } from './index';


/**
 * Wrapper around of native mongodb cursor, based
 * on marsdb observable cursor.
 */
export default class MongoCursor extends CursorObservable {
  constructor(db, query, options) {
    super(db, query, options);
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
        if (this._sort !== undefined) {
          nativeCursor.sort(this._sort);
        }
        if (this.options.fields !== undefined) {
          nativeCursor.project(this.options.fields);
        }

        if (this.options.count) {
          return nativeCursor.count();
        } else {
          return nativeCursor.toArray();
        }
      })
      .then(docs => this.processPipeline(docs));
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
