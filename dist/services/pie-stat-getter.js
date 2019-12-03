"use strict";

var _interopRequireWildcard = require("babel-runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("babel-runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("babel-runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("babel-runtime/helpers/asyncToGenerator"));

var _slicedToArray2 = _interopRequireDefault(require("babel-runtime/helpers/slicedToArray"));

var _lodash = _interopRequireDefault(require("lodash"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _moment = _interopRequireDefault(require("moment"));

var _forestExpress = require("forest-express");

var _orm = _interopRequireWildcard(require("../utils/orm"));

var _database = require("../utils/database");

var _filtersParser = _interopRequireDefault(require("./filters-parser"));

// NOTICE: These aliases are not camelcased to prevent issues with Sequelize.
var ALIAS_GROUP_BY = 'forest_alias_groupby';
var ALIAS_AGGREGATE = 'forest_alias_aggregate';

function PieStatGetter(model, params, options) {
  var needsDateOnlyFormating = (0, _orm.isVersionLessThan4)(options.sequelize);
  var schema = _forestExpress.Schemas.schemas[model.name];
  var associationSplit;
  var associationCollection;
  var associationField;
  var associationSchema;
  var field;

  if (params.group_by_field.indexOf(':') === -1) {
    field = _lodash.default.find(schema.fields, function (currentField) {
      return currentField.field === params.group_by_field;
    });
  } else {
    associationSplit = params.group_by_field.split(':');
    associationCollection = model.associations[associationSplit[0]].target.name;
    var _associationSplit = associationSplit;

    var _associationSplit2 = (0, _slicedToArray2.default)(_associationSplit, 2);

    associationField = _associationSplit2[1];
    associationSchema = _forestExpress.Schemas.schemas[associationCollection];
    field = _lodash.default.find(associationSchema.fields, function (currentField) {
      return currentField.field === associationField;
    });
  }

  function getGroupByField() {
    if (params.group_by_field.includes(':')) {
      var _params$group_by_fiel = params.group_by_field.split(':'),
          _params$group_by_fiel2 = (0, _slicedToArray2.default)(_params$group_by_fiel, 2),
          associationName = _params$group_by_fiel2[0],
          fieldName = _params$group_by_fiel2[1];

      return "".concat(associationName, ".").concat(_orm.default.getColumnName(associationSchema, fieldName));
    }

    return "".concat(schema.name, ".").concat(_orm.default.getColumnName(schema, params.group_by_field));
  }

  var groupByField = getGroupByField();

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

  function getGroupBy() {
    return (0, _database.isMSSQL)(options) ? [options.sequelize.col(groupByField)] : [ALIAS_GROUP_BY];
  }

  function formatResults(records) {
    return _bluebird.default.map(records, function (record) {
      var key;

      if (field.type === 'Date') {
        key = (0, _moment.default)(record[ALIAS_GROUP_BY]).format('DD/MM/YYYY HH:mm:ss');
      } else if (field.type === 'Dateonly' && needsDateOnlyFormating) {
        var offsetServer = (0, _moment.default)().utcOffset() / 60;

        var dateonly = _moment.default.utc(record[ALIAS_GROUP_BY]).add(offsetServer, 'h');

        key = dateonly.format('DD/MM/YYYY');
      } else {
        key = String(record[ALIAS_GROUP_BY]);
      }

      return {
        key: key,
        value: record[ALIAS_AGGREGATE]
      };
    });
  }

  this.perform = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee() {
    var where;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return new _filtersParser.default(schema, params.timezone, options).perform(params.filters);

          case 2:
            where = _context.sent;
            return _context.abrupt("return", model.unscoped().findAll({
              attributes: [[options.sequelize.col(groupByField), ALIAS_GROUP_BY], [options.sequelize.fn(getAggregate(), options.sequelize.col(getAggregateField())), ALIAS_AGGREGATE]],
              include: getIncludes(),
              where: where,
              group: getGroupBy(),
              order: [[options.sequelize.literal(ALIAS_AGGREGATE), 'DESC']],
              raw: true
            }).then(formatResults).then(function (records) {
              return {
                value: records
              };
            }));

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
}

module.exports = PieStatGetter;