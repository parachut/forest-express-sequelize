"use strict";

var _interopRequireDefault = require("babel-runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("babel-runtime/helpers/slicedToArray"));

var _defineProperty2 = _interopRequireDefault(require("babel-runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("babel-runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("babel-runtime/helpers/asyncToGenerator"));

var _forestExpress = require("forest-express");

var _operators = _interopRequireDefault(require("../utils/operators"));

var _errors = require("./errors");

var _require = require('../utils/query'),
    getReferenceField = _require.getReferenceField;

function FiltersParser(modelSchema, timezone, options) {
  var _this = this;

  this.OPERATORS = new _operators.default(options);
  this.operatorDateParser = new _forestExpress.BaseOperatorDateParser({
    operators: this.OPERATORS,
    timezone: timezone
  });

  this.perform = function () {
    var _ref = (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee(filtersString) {
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", _forestExpress.BaseFiltersParser.perform(filtersString, _this.formatAggregation, _this.formatCondition));

            case 1:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }();

  this.formatAggregation = function () {
    var _ref2 = (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee2(aggregator, formatedConditions) {
      var aggregatorOperator;
      return _regenerator.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              aggregatorOperator = _this.formatAggregatorOperator(aggregator);
              return _context2.abrupt("return", (0, _defineProperty2.default)({}, aggregatorOperator, formatedConditions));

            case 2:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function (_x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  }();

  this.formatCondition = function () {
    var _ref4 = (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee3(condition) {
      var formatedField;
      return _regenerator.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              formatedField = _this.formatField(condition.field);

              if (!_this.operatorDateParser.isDateOperator(condition.operator)) {
                _context3.next = 3;
                break;
              }

              return _context3.abrupt("return", (0, _defineProperty2.default)({}, formatedField, _this.operatorDateParser.getDateFilter(condition.operator, condition.value)));

            case 3:
              return _context3.abrupt("return", (0, _defineProperty2.default)({}, formatedField, _this.formatOperatorValue(condition.operator, condition.value)));

            case 4:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    return function (_x4) {
      return _ref4.apply(this, arguments);
    };
  }();

  this.formatAggregatorOperator = function (aggregatorOperator) {
    switch (aggregatorOperator) {
      case 'and':
        return _this.OPERATORS.AND;

      case 'or':
        return _this.OPERATORS.OR;

      default:
        throw new _errors.NoMatchingOperatorError();
    }
  };

  this.formatOperator = function (operator) {
    switch (operator) {
      case 'not':
        return _this.OPERATORS.NOT;

      case 'greater_than':
      case 'after':
        return _this.OPERATORS.GT;

      case 'less_than':
      case 'before':
        return _this.OPERATORS.LT;

      case 'contains':
      case 'starts_with':
      case 'ends_with':
        return _this.OPERATORS.LIKE;

      case 'not_contains':
        return _this.OPERATORS.NOT_LIKE;

      case 'present':
      case 'not_equal':
        return _this.OPERATORS.NE;

      case 'blank':
      case 'equal':
        return _this.OPERATORS.EQ;

      default:
        throw new _errors.NoMatchingOperatorError();
    }
  };

  this.formatValue = function (operator, value) {
    switch (operator) {
      case 'not':
      case 'greater_than':
      case 'less_than':
      case 'not_equal':
      case 'equal':
      case 'before':
      case 'after':
        return value;

      case 'contains':
      case 'not_contains':
        return "%".concat(value, "%");

      case 'starts_with':
        return "".concat(value, "%");

      case 'ends_with':
        return "%".concat(value);

      case 'present':
      case 'blank':
        return null;

      default:
        throw new _errors.NoMatchingOperatorError();
    }
  };

  this.formatOperatorValue = function (operator, value) {
    switch (operator) {
      case 'not':
        return (0, _defineProperty2.default)({}, _this.OPERATORS.NOT, value);

      case 'greater_than':
      case 'after':
        return (0, _defineProperty2.default)({}, _this.OPERATORS.GT, value);

      case 'less_than':
      case 'before':
        return (0, _defineProperty2.default)({}, _this.OPERATORS.LT, value);

      case 'contains':
        return (0, _defineProperty2.default)({}, _this.OPERATORS.LIKE, "%".concat(value, "%"));

      case 'starts_with':
        return (0, _defineProperty2.default)({}, _this.OPERATORS.LIKE, "".concat(value, "%"));

      case 'ends_with':
        return (0, _defineProperty2.default)({}, _this.OPERATORS.LIKE, "%".concat(value));

      case 'not_contains':
        return (0, _defineProperty2.default)({}, _this.OPERATORS.NOT_LIKE, "%".concat(value, "%"));

      case 'present':
        return (0, _defineProperty2.default)({}, _this.OPERATORS.NE, null);

      case 'not_equal':
        return (0, _defineProperty2.default)({}, _this.OPERATORS.NE, value);

      case 'blank':
        return (0, _defineProperty2.default)({}, _this.OPERATORS.EQ, null);

      case 'equal':
        return (0, _defineProperty2.default)({}, _this.OPERATORS.EQ, value);

      default:
        throw new _errors.NoMatchingOperatorError();
    }
  };

  this.formatField = function (field) {
    if (field.includes(':')) {
      var _field$split = field.split(':'),
          _field$split2 = (0, _slicedToArray2.default)(_field$split, 2),
          associationName = _field$split2[0],
          fieldName = _field$split2[1];

      return "$".concat(getReferenceField(_forestExpress.Schemas.schemas, modelSchema, associationName, fieldName), "$");
    }

    return field;
  }; // NOTICE: Look for a previous interval condition matching the following:
  //         - If the filter is a simple condition at the root the check is done right away.
  //         - There can't be a previous interval condition if the aggregator is 'or' (no meaning).
  //         - The condition's operator has to be elligible for a previous interval.
  //         - There can't be two previous interval condition.


  this.getPreviousIntervalCondition = function (filtersString) {
    var filters = _forestExpress.BaseFiltersParser.parseFiltersString(filtersString);

    var currentPreviousInterval = null; // NOTICE: Leaf condition at root

    if (filters && !filters.aggregator) {
      if (_this.operatorDateParser.hasPreviousDateInterval(filters.operator)) {
        return filters;
      }

      return null;
    } // NOTICE: No previous interval condition when 'or' aggregator


    if (filters.aggregator === 'and') {
      for (var i = 0; i < filters.conditions.length; i += 1) {
        var condition = filters.conditions[i]; // NOTICE: Nested filters

        if (condition.aggregator) {
          return null;
        }

        if (_this.operatorDateParser.hasPreviousDateInterval(condition.operator)) {
          // NOTICE: There can't be two previousInterval.
          if (currentPreviousInterval) {
            return null;
          }

          currentPreviousInterval = condition;
        }
      }
    }

    return currentPreviousInterval;
  };

  this.getAssociations = function () {
    var _ref18 = (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee4(filtersString) {
      return _regenerator.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", _forestExpress.BaseFiltersParser.getAssociations(filtersString));

            case 1:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    return function (_x5) {
      return _ref18.apply(this, arguments);
    };
  }();
}

module.exports = FiltersParser;