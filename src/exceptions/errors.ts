export class ArangoSmoothieError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class PathN1qlError extends ArangoSmoothieError {}
export class BuildSchemaError extends ArangoSmoothieError {}
export class ImmutableError extends ArangoSmoothieError {}
export class BuildIndexQueryError extends ArangoSmoothieError {}
export class BuildQueryError extends ArangoSmoothieError {}
export class BadKeyGeneratorDelimiterError extends ArangoSmoothieError {
  name = 'BadKeyGeneratorDelimiter';
}
export class InvalidModelReferenceError extends ArangoSmoothieError {
  name = 'InvalidModelReferenceError';
}
