import applyValidator, { ValidatorOption } from '../helpers/validatior';
import ValidationError from '../error/validation';

export enum VALIDATION_STRATEGY {
  STRICT = 'strict',
  EQUAL = 'equal',
}
export interface CoreTypeOptions {
  required?: boolean | RequiredOption | RequiredFunction;
  /**
   * If truthy, Ottoman will disallow changes to this path once the document is saved to the database for the first time.
   **/
  immutable?: boolean;
  default?: unknown;
  validator?: ValidatorOption | ValidatorFunction | string;
}

export enum CAST_STRATEGY {
  KEEP = 'keep',
  DROP = 'drop',
  THROW = 'throw',
  DEFAULT_OR_DROP = 'defaultOrDrop',
  DEFAULT_OR_KEEP = 'defaultOrKeep',
}

export abstract class IType {
  protected constructor(public name: string, public typeName: string) {}
  abstract cast(value: unknown, strategy?: CAST_STRATEGY): unknown;
  abstract validate(value: unknown, strict?: boolean): unknown;
}

export type RequiredFunction = () => boolean | RequiredOption;

export interface RequiredOption {
  val: boolean;
  message: string;
}

export type ValidatorFunction = (value: unknown) => void;

export type AutoFunction = () => unknown;

/**
 *  @param name of field in schema
 *  @param typeName name of type
 *  @param options
 *  @param options.required flag to define if the field is mandatory
 *  @param options.validator that will be applied to the field, allowed function, object or string with the name of the custom validator
 *  @param options.default that will define the initial value of the field, this option allows a value or a function
 *  @param options.immutable that will define this field as immutable. Ottoman prevents you from changing immutable fields if the schema as configure like strict
 */
export abstract class CoreType extends IType {
  protected constructor(name: string, typeName: string, public options?: CoreTypeOptions) {
    super(name, typeName);
    this.name = name;
    this.typeName = typeName;
  }

  static sName;

  get required(): boolean | RequiredOption | RequiredFunction {
    return this.options?.required || false;
  }

  get validator(): ValidatorOption | ValidatorFunction | string | undefined {
    return this.options?.validator;
  }

  get default(): unknown {
    return this.options?.default;
  }

  buildDefault(): unknown {
    if (typeof this.default === 'function') {
      return this.default();
    } else {
      return this.default;
    }
  }

  // eslint-disable-next-line no-unused-vars
  validate(value: unknown, strict = true): unknown {
    if (this.isEmpty(value)) {
      const _required = this.checkRequired() || '';
      if (_required.length > 0) {
        throw new ValidationError(_required);
      }
    }
    return value;
  }

  checkRequired(): string | void {
    const _required = (typeof this.required === 'function' ? this.required() : this.required) as RequiredOption;
    if (typeof _required.val !== 'undefined' && _required.val) {
      return _required.message;
    } else if (!!_required) {
      return `Property '${this.name}' is required`;
    }
  }

  checkValidator(value: unknown): void {
    applyValidator(value, this.validator, this.name);
  }

  isEmpty(value: unknown): boolean {
    return value === undefined || value === null;
  }

  isStrictStrategy(strategy: VALIDATION_STRATEGY): boolean {
    return strategy == VALIDATION_STRATEGY.STRICT;
  }
}
