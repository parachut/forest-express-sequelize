"use strict";

var _interopRequireDefault = require("babel-runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("babel-runtime/helpers/slicedToArray"));

var _orm = _interopRequireDefault(require("./orm"));

exports.getReferenceField = function (schemas, modelSchema, associationName, fieldName) {
  function getDefaultValue() {
    return "".concat(associationName, ".").concat(fieldName);
  }

  var schemaField = modelSchema.fields.find(function (field) {
    return field.field === associationName;
  }); // NOTICE: No reference field found, no name transformation tried.

  if (!schemaField || !schemaField.reference) {
    return getDefaultValue();
  }

  var _schemaField$referenc = schemaField.reference.split('.'),
      _schemaField$referenc2 = (0, _slicedToArray2.default)(_schemaField$referenc, 1),
      tableName = _schemaField$referenc2[0];

  var associationSchema = schemas[tableName]; // NOTICE: No association schema found, no name transformation tried.

  if (!associationSchema) {
    return getDefaultValue();
  }

  var belongsToColumnName = _orm.default.getColumnName(associationSchema, fieldName);

  return "".concat(associationName, ".").concat(belongsToColumnName);
};