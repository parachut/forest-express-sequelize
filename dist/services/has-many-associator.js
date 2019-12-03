var _ = require('lodash');

var orm = require('../utils/orm');

function HasManyAssociator(model, association, opts, params, data) {
  this.perform = function perform() {
    return orm.findRecord(model, params.recordId).then(function (record) {
      var associatedIds = _.map(data.data, function (value) {
        return value.id;
      }); // NOTICE: Deactivate validation to prevent potential issues with custom model validations.
      //         In this case, the full record attributes are missing which may raise an
      //         unexpected validation error.


      return record["add".concat(_.upperFirst(params.associationName))](associatedIds, {
        validate: false
      });
    });
  };
}

module.exports = HasManyAssociator;