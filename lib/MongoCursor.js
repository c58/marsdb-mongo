import { CursorObservable } from 'marsdb';

export default class MongoCursor extends CursorObservable {
  constructor() {
    super(db, query, options);
  }
}
