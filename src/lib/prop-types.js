// Property type definition

export class Type {
  constructor(opts) {
    this.default = opts.default;
  }
}

export class Float extends Type {
  constructor(opts) {
    super(opts.default);
    this.min = opts.min;
    this.max = opts.max;
  }
}

export class Integer extends Type {
  constructor(opts) {
    super(opts.default);
    this.min = opts.min;
    this.max = opts.max;
  }
}
