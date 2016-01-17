import { CursorObservable } from 'marsdb';

export default class MongoCursor extends CursorObservable {
  constructor(db, query, options) {
    super(db, query, options);
  }
}
