var _ = require('lodash');

var ResourcesGetter = require('./resources-getter');

var HasManyGetter = require('./has-many-getter');

var BATCH_INITIAL_PAGE = 1;
var BATCH_SIZE = 1000;

function ResourcesExporter(model, options, params, association) {
  var primaryKeys = _.keys((association || model).primaryKeys);

  params.sort = primaryKeys[0] || 'id';
  params.page = {
    size: BATCH_SIZE
  };

  function getter() {
    if (association) {
      return new HasManyGetter(model, association, options, params);
    }

    return new ResourcesGetter(model, options, params);
  }

  function retrieveBatch(dataSender, pageNumber) {
    params.page.number = pageNumber;
    return getter().perform().then(function (results) {
      var records = results[0];
      return dataSender(records).then(function () {
        if (records.length === BATCH_SIZE) {
          return retrieveBatch(dataSender, pageNumber + 1);
        }

        return null;
      });
    });
  }

  this.perform = function (dataSender) {
    return retrieveBatch(dataSender, BATCH_INITIAL_PAGE);
  };
}

module.exports = ResourcesExporter;