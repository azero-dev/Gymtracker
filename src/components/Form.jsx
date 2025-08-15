import { h } from "preact";
import { useState } from "preact/hooks";

export default function Form() {
  return (
    <form id="form">
      <div class="form-group">
        <div class="input-group">
          <label for="weight">Weight:</label>
          <input type="number" id="weight" name="peso" autofocus />
        </div>
        <div class="input-group">
          <label for="distance">Distance:</label>
          <input type="number" id="distance" name="distance" required />
        </div>
        <div class="input-group">
          <label for="time">Time:</label>
          <input type="number" id="time" name="time" required />
        </div>
        <div class="input-group">
          <label for="food">Did you eat before trainning?</label>
          <input type="checkbox" id="food" name="food" value="0" />
        </div>
      </div>
      <button type="submit" id="submitBtn">
        Send
      </button>
    </form>
  );
}
