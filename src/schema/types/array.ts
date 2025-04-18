import { CAST_STRATEGY, CoreType, CoreTypeOptions, IType } from "./core";
import Utils from '../../utils';
import ValidationError from "../error/validation";

/**
 * Array type supports arrays of [SchemaTypes](/docs/api/classes/schema.html) and arrays of subdocuments.
 *
 * ## Options
 *
 * - **required** flag to define if the field is mandatory
 * - **validator** that will be applied to the field, allowed function, object or string with the name of the custom validator
 * - **default** that will define the initial value of the field, allowed and value or function to generate it
 * - **immutable** that will define this field as immutable. Ottoman prevents you from changing immutable fields if the schema as configure like strict
 *
 * @example
 * ```typescript
 * const postSchemaDef = new Schema({
 *   postTags: [String],
 *   comments: [{ type: commentSchema, ref: 'Comment' }],
 * });
 * ```
 */
export default class ArrayType extends CoreType {
  constructor(name: string, public itemType: IType, options?: CoreTypeOptions) {
    super(name, ArrayType.sName, options);
  }

  static sName = Array.name;

  cast(value: unknown, strategy = CAST_STRATEGY.DEFAULT_OR_DROP): unknown {
    if (Utils.is(value, Array)) {
      return Utils.ensureArrayItemsType(value, this.itemType, strategy);
    }
    return Utils.checkCastStrategy(value, strategy, this);
  }

  validate(value: unknown, strict = true) {
    value = super.validate(value, strict);
    if (this.isEmpty(value)) return value;
    if (!Utils.is(value, Array)) {
      throw new ValidationError(`Property '${this.name}' must be of type '${this.typeName}'`);
    }
    const _value = value as unknown[];
    const _valueResult: unknown[] = [];
    this.checkValidator(_value);
    for (const key in _value) {
      _valueResult.push(this.itemType.validate(_value[key], strict));
    }
    return _valueResult;
  }
}

export const arrayTypeFactory = (name: string, item: CoreType, options?: CoreTypeOptions): ArrayType =>
  new ArrayType(name, item, options);
