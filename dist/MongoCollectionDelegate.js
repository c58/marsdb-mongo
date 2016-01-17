"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MongoCollectionDelegate = (function () {
  function MongoCollectionDelegate(db) {
    _classCallCheck(this, MongoCollectionDelegate);

    this.db = db;
  }

  _createClass(MongoCollectionDelegate, [{
    key: "insert",
    value: function insert(doc) {
      // TODO

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    }
  }, {
    key: "remove",
    value: function remove(query) {
      // TODO

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    }
  }, {
    key: "update",
    value: function update(query, modifier) {
      // TODO

      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
    }
  }, {
    key: "find",
    value: function find(query) {
      // TODO

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    }
  }, {
    key: "findOne",
    value: function findOne(query, sortObj) {
      // TODO

      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
    }
  }, {
    key: "count",
    value: function count(query) {
      // TODO

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    }
  }, {
    key: "ids",
    value: function ids(query) {
      // TODO

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    }
  }]);

  return MongoCollectionDelegate;
})();

exports.default = MongoCollectionDelegate;