export class Value {
  constructor() {
    this.id = crypto.randomUUID();
    this.value = new Set();
  }
  addOption(option) {
    this.value.add(option);
  }
  getValue() {
    return this.value;
  }
  getValueArray() {
    return Array.from(this.value);
  }
  toJSON() {
    return {
      id: this.id,
      value: Array.from(this.options),
    };
  }
  //TODO: add: Remove value
}
