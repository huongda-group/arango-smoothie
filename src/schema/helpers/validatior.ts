export interface ValidatorOption {
  regexp: RegExp;
  message: string;
}

export type ValidatorFunction = (value: unknown) => void;

export default (
  val: unknown,
  validator: ValidatorOption | ValidatorFunction | string | undefined,
  name?: string,
): string | void => {
  let _validator: ValidatorFunction | undefined = undefined;
  if (validator !== undefined) {
    switch (typeof validator) {
      case 'string':
        if (typeof Schema.validators[validator] === 'undefined') {
          throw new BuildSchemaError(`Validator '${validator}' for field '${name}' does not exist.`);
        }
        _validator = Schema.validators[validator];
        break;
      case 'function':
        _validator = validator;
        break;
      case 'object':
        if (!validator.regexp !== undefined) {
          _validator = (value) => {
            if (!validator.regexp.test(String(value))) {
              throw new ValidationError(validator.message);
            }
          };
        }
    }
    if (_validator !== undefined) {
      _validator(val);
    }
  }
};
