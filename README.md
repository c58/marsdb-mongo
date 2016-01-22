MarsDB-Mongo
=========

[![Build Status](https://travis-ci.org/c58/marsdb-mongo.svg?branch=master)](https://travis-ci.org/c58/marsdb-mongo)
[![npm version](https://badge.fury.io/js/marsdb-mongo.svg)](https://www.npmjs.com/package/marsdb-mongo)
[![Dependency Status](https://david-dm.org/c58/marsdb-mongo.svg)](https://david-dm.org/c58/marsdb-mongo)

[MarsDB](https://github.com/c58/marsdb) plugin for making all queries works through MongoDB.
It may be useful with any server-side application, based on MongoDB. Use awesome MarsDB's promise based interface and data processing pipeline. It also supports observable cursor, but it does not support scaling for now (observed only app update/remove/insert operations)

## Usage
```javascript
import Collection from ‘marsdb’;
import MarsMongo from 'marsdb-mongo';

// Setup MarsDB to use MongoDB as a backend
// and connect to a mongo database (async)
MarsMongo.configure({ url: 'mongodb://127.0.0.1/marsdb_awesome' });

// Now you can use configured collection, observe
// cursors and do cool things with the collection.
const users = new Collection(‘users’);
users.insert({name: 'Marsdb User'}).then((userId) => {
  console.log(userId);
});
```

## Contributing
I’m waiting for your pull requests and issues.
Don’t forget to execute `gulp lint` before requesting. Accepted only requests without errors.

## License
See [License](LICENSE)