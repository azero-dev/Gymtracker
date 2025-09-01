export class Template {
  constructor() {
    this.id = crypto.randomUUID();
    this.name = "";
    this.parameters = new Map();
    this.highlights = new Set();
  }
  setName(name) {
    this.name = name;
  }
  getName() {
    return this.name;
  }
  setParameter(parameter) {
    this.parameters.set(parameter.id, parameter);
  }
  getParameters() {
    return this.parameters;
  }
  getParametersArray() {
    return Array.from(this.parameters.values());
  }
  setHighlights(valueSet) {
    if (this.highlights.size < 3) {
      if (this.highlights.has(valueSet)) {
        console.warn("[SessionType] Highlight value already exists");
        return false;
      } else {
        this.highlights.add(valueSet);
        return true;
      }
    } else {
      console.warn("[SessionType] Cannot add more than 3 highlights values");
      return false;
    }
  }
  getHighlights() {
    return this.highlights;
  }
  getHighlightsArray() {
    return Array.from(this.highlights);
  }
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      parameters: Object.fromEntries(
        Array.from(this.parameters.entries()).map(([key, value]) => [
          key,
          value.toJSON(),
        ]),
      ),
    };
  }
  //TODO: add: Remove parameters
}
