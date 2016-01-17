import { CursorObservable } from 'marsdb';
import DocumentMatcher from 'marsdb/lib/DocumentMatcher';
import { getDb } from './index';


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

        return nativeCursor.toArray();
      })
      .then(docs => this.processPipeline(docs));
      .then(docs => {
        this._executing = null;
        return docs;
      });
    }

    return this._executing;
  }

  _ensureMatcherSorter() {
    this._matcher = new DocumentMatcher(this._query || {});
  }

  _matchObjects() {
    // do nothing
  }
}
