import { CAST_STRATEGY, CoreType, CoreTypeOptions } from "./core";
import Utils from "../../utils";
import ValidationError from "../error/validation";

export const validateMinDate = (value: Date, min: Date | DateOption, property: string): string | void => {
  const _minDate: Date = (min as DateOption).val !== undefined ? (min as DateOption).val : (min as Date);
  if (_minDate > value) {
    return (min as DateOption).message !== undefined
      ? (min as DateOption).message
      : `Property ${property} cannot allow dates before ${_minDate.toISOString()}`;
  }
};

export const validateMaxDate = (value: Date, max: Date | DateOption, property: string): string | void => {
  const _maxDate: Date = (max as DateOption).val !== undefined ? (max as DateOption).val : (max as Date);
  if (_maxDate < value) {
    return (max as DateOption).message !== undefined
      ? (max as DateOption).message
      : `Property ${property} cannot allow dates after ${_maxDate.toISOString()}`;
  }
};

export interface DateOption {
  val: Date;
  message: string;
}

export type DateFunction = () => Date | DateOption;

/**
 * @field `min` date value that will be accepted
 * @field `max` date value that will be accepted
 * */
interface DateTypeOptions {
  min?: Date | DateOption | DateFunction | string;
  max?: Date | DateOption | DateFunction | string;
}

/**
 * `Date` are plain JavaScript Date.
 *
 * ## Options
 *
 * - **required** flag to define if the field is mandatory
 * - **validator** that will be applied to the field a validation function, validation object or string with the name of the custom validator
 * - **default** that will define the initial value of the field, this option allows a value or a function
 * - **immutable** that will define this field as immutable. Ottoman prevents you from changing immutable fields if the schema as configure like strict
 * - **min** minimum date value that will be accepted
 * - **max** maximum date value that will be accepted
 *
 * @example
 * ```typescript
 * const userSchema =  new Schema({
 *   birthday: { type: Date, min: '1990-12-31', max: new Date() },
 *   hired: Schema.Types.Date
 * })
 * ```
 */
export default class DateType extends CoreType {
  constructor(name: string, options?: DateTypeOptions & CoreTypeOptions) {
    super(name, DateType.sName, options);
  }

  static sName = Date.name;

  get min(): Date | DateOption | DateFunction | undefined {
    const _min = (this.options as DateTypeOptions).min;
    if (typeof _min === 'string') {
      return new Date(String(_min));
    }
    return _min;
  }

  get max(): Date | DateOption | DateFunction | undefined {
    const _max = (this.options as DateTypeOptions).max;
    if (typeof _max === 'string') {
      return new Date(String(_max));
    }
    return _max;
  }

  buildDefault(): Date | undefined {
    const result: any = super.buildDefault();
    if (result) {
      return !(result instanceof Date) ? new Date(String(result)) : (result as Date);
    }
    return result;
  }

  cast(value: any, strategy = CAST_STRATEGY.DEFAULT_OR_DROP) {
    if (Utils.isDateValid(value)) {
      return new Date(value);
    } else {
      return Utils.checkCastStrategy(value, strategy, this);
    }
  }

  validate(value: unknown, strategy) {
    value = super.validate(value, strategy);
    if (this.isEmpty(value)) return value;
    const _value = this.isStrictStrategy(strategy)
      ? Utils.is(value, Date)
        ? (value as Date)
        : undefined
      : Utils.is(value, Date)
        ? (value as Date)
        : Utils.is(value, String)
          ? new Date(String(value))
          : Utils.is(value, Number)
            ? new Date(Number(value))
            : undefined;
    if (_value === undefined) {
      throw new ValidationError(`Property '${this.name}' must be of type '${this.typeName}'`);
    }
    this.checkValidator(_value);
    let errors: string[] = [];
    errors.push(this._checkMinDate(_value));
    errors.push(this._checkMaxDate(_value));
    errors = errors.filter((e) => e !== '');
    if (errors.length > 0) {
      throw new ValidationError(errors.join('\n'));
    }
    return _value;
  }

  private _checkMinDate(val: Date): string {
    const _min = typeof this.min === 'function' ? this.min() : this.min;
    if (_min === undefined) {
      return '';
    }
    return validateMinDate(val, _min, this.name) || '';
  }

  private _checkMaxDate(val: Date): string {
    const _max = typeof this.max === 'function' ? this.max() : this.max;
    if (_max === undefined) {
      return '';
    }
    return validateMaxDate(val, _max, this.name) || '';
  }
}

export const dateTypeFactory = (name: string, opts: DateTypeOptions & CoreTypeOptions): DateType =>
  new DateType(name, opts);
