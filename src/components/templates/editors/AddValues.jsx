import { useEffect, useState, useRef } from "preact/hooks";
// import { Values } from "../../../models/Values.js";

export default function AddValues({ onUpdateValues }) {
  // const values = useRef(new Values()).current;
  const [value, setValue] = useState("");

  const handleClick = () => {
    onUpdateValues(value);
    setValue("");
    // TODO: validate before sending to parent
  };

  return (
    <div>
      <p>Add values</p>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="bg-white text-black"
      />
      <button onClick={handleClick}>Save value</button>
    </div>
  );
}
