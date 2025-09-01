export class Parameter {
  constructor() {
    this.id = "";
    this.name = "";
    this.units = "";
    this.values = new Set();
  }
  setName(name) {
    this.name = name;
  }
  getName() {
    return this.name;
  }
  setID(id) {
    this.id = id;
  }
  getID() {
    return this.id;
  }
  setUnits(units) {
    this.units = units;
  }
  getUnits() {
    return this.units;
  }
  setValues(valueSet) {
    // TODO: check: needs clear before setting new values?
    this.values.add(valueSet);
  }
  getValues() {
    return this.values;
  }
  getValuesArray() {
    return Array.from(this.values);
  }
  // toJSON() {
  //   return {
  //     name: this.name,
  //     id: this.id,
  //     units: this.units,
  //     values: Object.fromEntries(
  //       Array.from(this.values.entries()).map(([key, value]) => [
  //         key,
  //         value.toJSON(),
  //       ]),
  //     ),
  //   };
  // }
  //TODO:add: Remove values
}
