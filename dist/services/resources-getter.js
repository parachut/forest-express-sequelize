"use strict";

var _interopRequireDefault = require("babel-runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("babel-runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("babel-runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("babel-runtime/helpers/asyncToGenerator"));

var _lodash = _interopRequireDefault(require("lodash"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _forestExpress = require("forest-express");

var _operators = _interopRequireDefault(require("../utils/operators"));

var _compositeKeysManager = _interopRequireDefault(require("./composite-keys-manager"));

var _queryBuilder = _interopRequireDefault(require("./query-builder"));

var _searchBuilder = _interopRequireDefault(require("./search-builder"));

var _liveQueryChecker = _interopRequireDefault(require("./live-query-checker"));

var _errors = require("./errors");

var _filtersParser = _interopRequireDefault(require("./filters-parser"));

function ResourcesGetter(model, options, params) {
  var getFieldNamesRequested = function () {
    var _ref = (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee() {
      var associations, associationFromSorting;
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(!params.fields || !params.fields[model.name])) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return", null);

            case 2:
              if (!params.filters) {
                _context.next = 8;
                break;
              }

              _context.next = 5;
              return filterParser.getAssociations(params.filters);

            case 5:
              _context.t0 = _context.sent;
              _context.next = 9;
              break;

            case 8:
              _context.t0 = [];

            case 9:
              associations = _context.t0;

              if (params.sort && params.sort.includes('.')) {
                associationFromSorting = params.sort.split('.')[0];

                if (associationFromSorting[0] === '-') {
                  associationFromSorting = associationFromSorting.substring(1);
                }

                associations.push(associationFromSorting);
              } // NOTICE: Force the primaryKey retrieval to store the records properly in the client.


              return _context.abrupt("return", _lodash.default.union([primaryKey], params.fields[model.name].split(','), associations));

            case 12:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function getFieldNamesRequested() {
      return _ref.apply(this, arguments);
    };
  }();

  var handleFilterParams = function () {
    var _ref2 = (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee2() {
      return _regenerator.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", filterParser.perform(params.filters));

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function handleFilterParams() {
      return _ref2.apply(this, arguments);
    };
  }();

  var getWhere = function () {
    var _ref3 = (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee4() {
      return _regenerator.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", new _bluebird.default(function () {
                var _ref4 = (0, _asyncToGenerator2.default)(
                /*#__PURE__*/
                _regenerator.default.mark(function _callee3(resolve, reject) {
                  var where, queryToFilterRecords;
                  return _regenerator.default.wrap(function _callee3$(_context3) {
                    while (1) {
                      switch (_context3.prev = _context3.next) {
                        case 0:
                          where = {};
                          where[OPERATORS.AND] = [];

                          if (params.search) {
                            where[OPERATORS.AND].push(getSearchBuilder().perform());
                          }

                          if (!params.filters) {
                            _context3.next = 9;
                            break;
                          }

                          _context3.t0 = where[OPERATORS.AND];
                          _context3.next = 7;
                          return handleFilterParams();

                        case 7:
                          _context3.t1 = _context3.sent;

                          _context3.t0.push.call(_context3.t0, _context3.t1);

                        case 9:
                          if (segmentWhere) {
                            where[OPERATORS.AND].push(segmentWhere);
                          }

                          if (!params.segmentQuery) {
                            _context3.next = 14;
                            break;
                          }

                          queryToFilterRecords = params.segmentQuery.trim();
                          new _liveQueryChecker.default().perform(queryToFilterRecords); // WARNING: Choosing the first connection might generate issues if the model does not
                          //          belongs to this database.

                          return _context3.abrupt("return", options.connections[0].query(queryToFilterRecords, {
                            type: options.sequelize.QueryTypes.SELECT
                          }).then(function (results) {
                            var recordIds = results.map(function (result) {
                              return result[primaryKey] || result.id;
                            });
                            var condition = (0, _defineProperty2.default)({}, primaryKey, {});
                            condition[primaryKey][OPERATORS.IN] = recordIds;
                            where[OPERATORS.AND].push(condition);
                            return resolve(where);
                          }, function (error) {
                            var errorMessage = "Invalid SQL query for this Live Query segment:\n".concat(error.message);

                            _forestExpress.logger.error(errorMessage);

                            reject(new _errors.ErrorHTTP422(errorMessage));
                          }));

                        case 14:
                          return _context3.abrupt("return", resolve(where));

                        case 15:
                        case "end":
                          return _context3.stop();
                      }
                    }
                  }, _callee3, this);
                }));

                return function (_x, _x2) {
                  return _ref4.apply(this, arguments);
                };
              }()));

            case 1:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    return function getWhere() {
      return _ref3.apply(this, arguments);
    };
  }();

  var getRecords = function () {
    var _ref5 = (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee5() {
      var scope, include;
      return _regenerator.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.t0 = fieldNamesRequested;

              if (_context5.t0) {
                _context5.next = 5;
                break;
              }

              _context5.next = 4;
              return getFieldNamesRequested();

            case 4:
              _context5.t0 = _context5.sent;

            case 5:
              fieldNamesRequested = _context5.t0;
              scope = segmentScope ? model.scope(segmentScope) : model.unscoped();
              include = queryBuilder.getIncludes(model, fieldNamesRequested);
              return _context5.abrupt("return", getWhere().then(function (where) {
                var findAllOpts = {
                  where: where,
                  include: include,
                  order: queryBuilder.getOrder(),
                  offset: queryBuilder.getSkip(),
                  limit: queryBuilder.getLimit()
                };

                if (params.search) {
                  _lodash.default.each(schema.fields, function (field) {
                    if (field.search) {
                      try {
                        field.search(findAllOpts, params.search);
                        hasSmartFieldSearch = true;
                      } catch (error) {
                        _forestExpress.logger.error("Cannot search properly on Smart Field ".concat(field.field), error);
                      }
                    }
                  });

                  var fieldsSearched = getSearchBuilder().getFieldsSearched();

                  if (fieldsSearched.length === 0 && !hasSmartFieldSearch) {
                    if (!params.searchExtended || !getSearchBuilder().hasExtendedSearchConditions()) {
                      // NOTICE: No search condition has been set for the current search, no record can be
                      //         found.
                      return [];
                    }
                  }
                }

                return scope.findAll(findAllOpts);
              }));

            case 9:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    return function getRecords() {
      return _ref5.apply(this, arguments);
    };
  }();

  var countRecords = function () {
    var _ref6 = (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee6() {
      var scope, include;
      return _regenerator.default.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.t0 = fieldNamesRequested;

              if (_context6.t0) {
                _context6.next = 5;
                break;
              }

              _context6.next = 4;
              return getFieldNamesRequested();

            case 4:
              _context6.t0 = _context6.sent;

            case 5:
              fieldNamesRequested = _context6.t0;
              scope = segmentScope ? model.scope(segmentScope) : model.unscoped();
              include = queryBuilder.getIncludes(model, fieldNamesRequested);
              return _context6.abrupt("return", getWhere().then(function (where) {
                var countOptions = {
                  include: include,
                  where: where
                };

                if (!primaryKey) {
                  // NOTICE: If no primary key is found, use * as a fallback for Sequelize.
                  countOptions.col = '*';
                }

                if (params.search) {
                  _lodash.default.each(schema.fields, function (field) {
                    if (field.search) {
                      try {
                        field.search(countOptions, params.search);
                        hasSmartFieldSearch = true;
                      } catch (error) {
                        _forestExpress.logger.error("Cannot search properly on Smart Field ".concat(field.field), error);
                      }
                    }
                  });

                  var fieldsSearched = getSearchBuilder().getFieldsSearched();

                  if (fieldsSearched.length === 0 && !hasSmartFieldSearch) {
                    if (!params.searchExtended || !getSearchBuilder().hasExtendedSearchConditions()) {
                      // NOTICE: No search condition has been set for the current search, no record can be
                      //         found.
                      return 0;
                    }
                  }
                }

                return scope.count(countOptions);
              }));

            case 9:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    return function countRecords() {
      return _ref6.apply(this, arguments);
    };
  }();

  var getSegmentCondition = function () {
    var _ref7 = (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee7() {
      return _regenerator.default.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              getSegment();

              if (!_lodash.default.isFunction(segmentWhere)) {
                _context7.next = 3;
                break;
              }

              return _context7.abrupt("return", segmentWhere(params).then(function (where) {
                segmentWhere = where;
              }));

            case 3:
              return _context7.abrupt("return", _bluebird.default.resolve());

            case 4:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, this);
    }));

    return function getSegmentCondition() {
      return _ref7.apply(this, arguments);
    };
  }();

  var schema = _forestExpress.Schemas.schemas[model.name];
  var queryBuilder = new _queryBuilder.default(model, options, params);
  var segmentScope;
  var segmentWhere;
  var OPERATORS = new _operators.default(options);

  var primaryKey = _lodash.default.keys(model.primaryKeys)[0];

  var filterParser = new _filtersParser.default(schema, params.timezone, options);
  var fieldNamesRequested;
  var searchBuilder;

  function getSearchBuilder() {
    if (searchBuilder) {
      return searchBuilder;
    }

    searchBuilder = new _searchBuilder.default(model, options, params, fieldNamesRequested);
    return searchBuilder;
  }

  var hasSmartFieldSearch = false;

  function getSegment() {
    if (schema.segments && params.segment) {
      var segment = _lodash.default.find(schema.segments, function (schemaSegment) {
        return schemaSegment.name === params.segment;
      });

      segmentScope = segment.scope;
      segmentWhere = segment.where;
    }
  }

  this.perform = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee8() {
    return _regenerator.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            return _context8.abrupt("return", getSegmentCondition().then(getRecords).then(function (records) {
              var fieldsSearched = null;

              if (params.search) {
                fieldsSearched = getSearchBuilder().getFieldsSearched();
              }

              if (schema.isCompositePrimary) {
                records.forEach(function (record) {
                  record.forestCompositePrimary = new _compositeKeysManager.default(model, schema, record).createCompositePrimary();
                });
              }

              return [records, fieldsSearched];
            }));

          case 1:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, this);
  }));
  this.count = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee9() {
    return _regenerator.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            return _context9.abrupt("return", getSegmentCondition().then(countRecords));

          case 1:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, this);
  }));
}

module.exports = ResourcesGetter;