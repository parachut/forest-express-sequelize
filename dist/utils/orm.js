var semver = require('semver');

var REGEX_VERSION = /(\d+\.)?(\d+\.)?(\*|\d+)/;

var getVersion = function getVersion(sequelize) {
  var version = sequelize.version.match(REGEX_VERSION);

  if (version && version[0]) {
    return version[0];
  }

  return null;
};

var isVersionLessThan4 = function isVersionLessThan4(sequelize) {
  try {
    return semver.lt(getVersion(sequelize), '4.0.0');
  } catch (error) {
    return true;
  }
};

var findRecord = function findRecord(model, recordId, options) {
  if (model.findByPk) {
    return model.findByPk(recordId, options);
  }

  return model.findById(recordId, options);
};

var getColumnName = function getColumnName(schema, fieldName) {
  var schemaField = schema.fields.find(function (field) {
    return field.field === fieldName;
  });
  return schemaField && schemaField.columnName ? schemaField.columnName : fieldName;
};

var isUUID = function isUUID(DataTypes, fieldType) {
  return fieldType instanceof DataTypes.UUID || fieldType instanceof DataTypes.UUIDV1 || fieldType instanceof DataTypes.UUIDV4;
};

exports.getVersion = getVersion;
exports.isVersionLessThan4 = isVersionLessThan4;
exports.findRecord = findRecord;
exports.getColumnName = getColumnName;
exports.isUUID = isUUID;