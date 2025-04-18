import { CAST_STRATEGY, CoreType, CoreTypeOptions } from "./core";
import Utils from "../../utils";
import ValidationError from "../error/validation";

export interface MinmaxOption {
  message: string;
  val: number;
}

export const validateMaxLimit = (
  val: number,
  max: number | MinmaxOption | undefined,
  property: string,
): string | void => {
  if (typeof max === 'number' && max < val) {
    return `Property '${property}' is more than the maximum allowed value of '${max}'`;
  }
  if (typeof max !== 'undefined') {
    const _obj = max as MinmaxOption;
    if (_obj.val < val) {
      return _obj.message;
    }
  }
};

export const validateMinLimit = (
  val: number,
  min: number | MinmaxOption | undefined,
  property: string,
): string | void => {
  if (typeof min === 'number' && min > val) {
    return `Property '${property}' is less than the minimum allowed value of '${min}'`;
  }
  if (typeof min !== 'undefined') {
    const _obj = min as MinmaxOption;
    if (_obj.val > val) {
      return _obj.message;
    }
  }
};

export type NumberFunction = () => number | MinmaxOption;

/**
 * @field `intVal` flag that will allow only integer values
 * @field `min` numeric value that will be accepted
 * @field `max` numeric value that will be accepted
 * */
interface NumberTypeOptions {
  intVal?: boolean;
  min?: number | NumberFunction | MinmaxOption;
  max?: number | NumberFunction | MinmaxOption;
}

/**
 * `Number` are plain JavaScript Number.
 *
 * ## Options
 *
 * - **required** flag to define if the field is mandatory
 * - **validator** that will be applied to the field a validation function, validation object or string with the name of the custom validator
 * - **default** that will define the initial value of the field, this option allows a value or a function
 * - **immutable** that will define this field as immutable. Ottoman prevents you from changing immutable fields if the schema as configure like strict
 * - **intVal** flag that will allow only integer values
 * - **min** minimum numerical value value that will be accepted
 * - **max** maximum numeric value that will be accepted
 *
 * @example
 * ```typescript
 * const userSchema =  new Schema({
 *   age: Number,
 * })
 * ```
 */
export default class NumberType extends CoreType {
  constructor(name: string, options?: CoreTypeOptions & NumberTypeOptions) {
    super(name, NumberType.sName, options);
  }

  static sName = Number.name;

  get max(): number | NumberFunction | MinmaxOption | undefined {
    const _options = this.options as NumberTypeOptions;
    return _options.max;
  }

  get min(): number | NumberFunction | MinmaxOption | undefined {
    const _options = this.options as NumberTypeOptions;
    return _options.min;
  }

  get intVal(): boolean {
    const _options = this.options as NumberTypeOptions;
    return typeof _options.intVal === 'undefined' ? false : _options.intVal;
  }

  cast(value: unknown, strategy = CAST_STRATEGY.DEFAULT_OR_DROP): unknown {
    const castedValue = Number(value);
    if (Utils.isNumber(castedValue)) {
      return castedValue;
    } else {
      return Utils.checkCastStrategy(value, strategy, this);
    }
  }

  validate(value: unknown, strategy) {
    value = super.validate(value, strategy);
    if (this.isEmpty(value)) return value;
    const _value = Number(value);
    let errors: string[] = [];
    const _wrongType = this.isStrictStrategy(strategy) ? !Utils.is(value, Number) : isNaN(_value);
    if (_wrongType) {
      throw new ValidationError(`Property '${this.name}' must be of type '${this.typeName}'`);
    }

    if (this.intVal && _value % 1 !== 0) {
      errors.push(`Property ${this.name} only allows Integer values`);
    }
    this.checkValidator(_value);
    errors.push(this._checkMin(_value));
    errors.push(this._checkMax(_value));
    errors = errors.filter((e) => e !== '');
    if (errors.length > 0) {
      throw new ValidationError(errors.join('\n'));
    }

    return _value;
  }

  private _checkMin(val: number): string {
    const _min = typeof this.min === 'function' ? this.min() : this.min;
    return validateMinLimit(val, _min, this.name) || '';
  }

  private _checkMax(val: number): string {
    const _max = typeof this.max === 'function' ? this.max() : this.max;
    return validateMaxLimit(val, _max, this.name) || '';
  }
}

export const numberTypeFactory = (name: string, otps: CoreTypeOptions & NumberTypeOptions): NumberType =>
  new NumberType(name, otps);
