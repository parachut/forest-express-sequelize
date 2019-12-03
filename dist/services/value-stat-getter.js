"use strict";

var _interopRequireDefault = require("babel-runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("babel-runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("babel-runtime/helpers/asyncToGenerator"));

var _lodash = _interopRequireDefault(require("lodash"));

var _forestExpress = require("forest-express");

var _operators = _interopRequireDefault(require("../utils/operators"));

var _filtersParser = _interopRequireDefault(require("./filters-parser"));

var _orm = _interopRequireDefault(require("../utils/orm"));

function ValueStatGetter(model, params, options) {
  var _this = this;

  var OPERATORS = new _operators.default(options);
  this.operatorDateParser = new _forestExpress.BaseOperatorDateParser({
    operators: OPERATORS,
    timezone: params.timezone
  });
  var schema = _forestExpress.Schemas.schemas[model.name];

  function getAggregate() {
    return params.aggregate.toLowerCase();
  }

  function getAggregateField() {
    // NOTICE: As MySQL cannot support COUNT(table_name.*) syntax, fieldName cannot be '*'.
    var fieldName = params.aggregate_field || schema.primaryKeys[0] || schema.fields[0].field;
    return "".concat(schema.name, ".").concat(_orm.default.getColumnName(schema, fieldName));
  }

  function getIncludes() {
    var includes = [];

    _lodash.default.values(model.associations).forEach(function (association) {
      if (['HasOne', 'BelongsTo'].indexOf(association.associationType) > -1) {
        includes.push({
          model: association.target.unscoped(),
          as: association.associationAccessor,
          attributes: []
        });
      }
    });

    return includes;
  }

  this.perform = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee() {
    var countCurrent, aggregateField, aggregate, where, rawPreviousInterval, conditionsParser;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            aggregateField = getAggregateField();
            aggregate = getAggregate();

            if (!params.filters) {
              _context.next = 8;
              break;
            }

            conditionsParser = new _filtersParser.default(schema, params.timezone, options);
            _context.next = 6;
            return conditionsParser.perform(params.filters);

          case 6:
            where = _context.sent;
            rawPreviousInterval = conditionsParser.getPreviousIntervalCondition(params.filters);

          case 8:
            return _context.abrupt("return", model.unscoped().aggregate(aggregateField, aggregate, {
              include: getIncludes(),
              where: where
            }).then(function (count) {
              countCurrent = count || 0;

              if (rawPreviousInterval) {
                var formatedPreviousDateInterval = _this.operatorDateParser.getPreviousDateFilter(rawPreviousInterval.operator, rawPreviousInterval.value);

                if (where[OPERATORS.AND]) {
                  where[OPERATORS.AND].forEach(function (condition) {
                    if (condition[rawPreviousInterval.field]) {
                      // NOTICE: Might not work on super edgy cases (when the 'rawPreviousInterval.field'
                      //        appears twice ont the filters)
                      condition[rawPreviousInterval.field] = formatedPreviousDateInterval;
                    }
                  });
                } else {
                  where[rawPreviousInterval.field] = formatedPreviousDateInterval;
                }

                return model.unscoped().aggregate(aggregateField, aggregate, {
                  include: getIncludes(),
                  where: where
                }).then(function (resultCount) {
                  return resultCount || 0;
                });
              }

              return undefined;
            }).then(function (countPrevious) {
              return {
                value: {
                  countCurrent: countCurrent,
                  countPrevious: countPrevious
                }
              };
            }));

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
}

module.exports = ValueStatGetter;