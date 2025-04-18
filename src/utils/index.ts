import { CAST_STRATEGY, CoreType } from "../schema/types/core";
import ValidationError from "../schema/error/validation";

const is = (val, type): boolean => ![undefined, null].includes(val) && (val.name === type.name || val.constructor.name === type.name);

const checkCastStrategy = (value: unknown, strategy: CAST_STRATEGY, type: CoreType) => {
  switch (strategy) {
    case CAST_STRATEGY.KEEP:
    case CAST_STRATEGY.DEFAULT_OR_KEEP:
      return value;
    case CAST_STRATEGY.THROW:
      throw new ValidationError(`Property '${type.name}' must be of type '${type.typeName}'`);
    case CAST_STRATEGY.DROP:
    case CAST_STRATEGY.DEFAULT_OR_DROP:
    default:
      return undefined;
  }
};

const isNumber = (val: unknown) => typeof val === 'number' && val === val;
const isDateValid = (val) => !Number.isNaN(new Date(val).valueOf());
const ensureArrayItemsType = (array, field, strategy) => array.map((item) => ensureTypes(item, field, strategy));


export default {
  is,
  checkCastStrategy,
  isNumber,
  isDateValid,
  ensureArrayItemsType
}

