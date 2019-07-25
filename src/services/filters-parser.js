import Operators from '../utils/operators';
import OperatorDateIntervalParser from './operator-date-interval-parser';
import { NoMatchingOperatorError, InvalidFiltersFormatError } from './errors';

function FiltersParser(filtersString, timezone, options) {
  this.OPERATORS = new Operators(options);
  this.operatorDateIntervalParser = new OperatorDateIntervalParser(timezone, options);

  try {
    this.filters = filtersString ? JSON.parse(filtersString) : null;
  } catch (error) {
    throw new InvalidFiltersFormatError();
  }

  this.perform = () => {
    if (!this.filters) return null;

    return this.formatAggregation(this.filters);
  };

  this.formatAggregation = (node) => {
    if (!node) throw new InvalidFiltersFormatError('Empty condition in filter');
    if (!node.aggregator) return this.formatCondition(node);

    const aggregatorOperator = this.formatAggregatorOperator(node.aggregator);
    const formatedConditions = [];

    node.conditions.forEach(condition =>
      formatedConditions.push(this.formatAggregation(condition)));

    return { [aggregatorOperator]: formatedConditions };
  };

  this.formatCondition = (condition) => {
    if (!condition) throw new InvalidFiltersFormatError('Empty condition in filter');
    const formatedField = this.formatField(condition.field);

    if (this.operatorDateIntervalParser.isDateIntervalOperator(condition.operator)) {
      return {
        [formatedField]: this.operatorDateIntervalParser
          .getDateIntervalFilter(condition.operator, condition.value),
      };
    }

    return { [formatedField]: this.formatOperatorValue(condition.operator, condition.value) };
  };

  this.formatAggregatorOperator = (aggregatorOperator) => {
    switch (aggregatorOperator) {
      case 'and':
        return this.OPERATORS.AND;
      case 'or':
        return this.OPERATORS.OR;
      default:
        throw new NoMatchingOperatorError();
    }
  };

  this.formatOperator = (operator) => {
    switch (operator) {
      case 'not':
        return this.OPERATORS.NOT;
      case 'greater_than':
      case 'after':
        return this.OPERATORS.GT;
      case 'less_than':
      case 'before':
        return this.OPERATORS.LT;
      case 'contains':
      case 'starts_with':
      case 'ends_with':
        return this.OPERATORS.LIKE;
      case 'not_contains':
        return this.OPERATORS.NOT_LIKE;
      case 'present':
      case 'not_equal':
        return this.OPERATORS.NE;
      case 'blank':
      case 'equal':
        return this.OPERATORS.EQ;
      default:
        throw new NoMatchingOperatorError();
    }
  };

  this.formatValue = (operator, value) => {
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
        return `%${value}%`;
      case 'starts_with':
        return `${value}%`;
      case 'ends_with':
        return `%${value}`;
      case 'present':
      case 'blank':
        return null;
      default:
        throw new NoMatchingOperatorError();
    }
  };

  this.formatOperatorValue = (operator, value) => {
    switch (operator) {
      case 'not':
        return { [this.OPERATORS.NOT]: value };
      case 'greater_than':
      case 'after':
        return { [this.OPERATORS.GT]: value };
      case 'less_than':
      case 'before':
        return { [this.OPERATORS.LT]: value };
      case 'contains':
        return { [this.OPERATORS.LIKE]: `%${value}%` };
      case 'starts_with':
        return { [this.OPERATORS.LIKE]: `${value}%` };
      case 'ends_with':
        return { [this.OPERATORS.LIKE]: `%${value}` };
      case 'not_contains':
        return { [this.OPERATORS.NOT_LIKE]: `%${value}%` };
      case 'present':
        return { [this.OPERATORS.NE]: null };
      case 'not_equal':
        return { [this.OPERATORS.NE]: value };
      case 'blank':
        return { [this.OPERATORS.EQ]: null };
      case 'equal':
        return { [this.OPERATORS.EQ]: value };
      default:
        throw new NoMatchingOperatorError();
    }
  };

  this.formatField = field => (field.includes(':') ? `$${field.replace(':', '.')}$` : field);

  // NOTICE: Look for a previous interval condition matching the following:
  //         - If the filter is a simple condition at the root the check is done right away.
  //         - There can't be a previous interval condition if the aggregator is 'or' (no meaning).
  //         - The condition's operator has to be elligible for a previous interval.
  //         - There can't be two previous interval condition.
  this.getPreviousIntervalCondition = () => {
    let currentPreviousInterval = null;

    // NOTICE: Leaf condition at root
    if (this.filters && !this.filters.aggregator) {
      if (this.operatorDateIntervalParser.hasPreviousDateInterval(this.filters.operator)) {
        return this.filters;
      }
      return null;
    }

    // NOTICE: No previous interval condition when 'or' aggregator
    if (this.filters.aggregator === 'and') {
      for (let i = 0; i < this.filters.conditions.length; i += 1) {
        const condition = this.filters.conditions[i];

        // NOTICE: Nested filters
        if (condition.aggregator) {
          return null;
        }

        if (this.operatorDateIntervalParser.hasPreviousDateInterval(condition.operator)) {
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
}

module.exports = FiltersParser;
