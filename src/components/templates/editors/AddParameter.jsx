import { useEffect, useState, useRef } from "preact/hooks";
import { Parameter } from "../../../models/Parameter.js";
import AddValue from "./AddValues.jsx";

export default function AddParameter({
  onUpdateParameters,
  paramID,
  onRemove,
  showRemove,
}) {
  // const parameter = useRef(new Parameter()).current;
  const [parameter, setParameter] = useState(new Parameter());
  const [name, setName] = useState("");
  const [units, setUnits] = useState("");
  const [valuesSet, setValuesSet] = useState([]);

  const onGetParameter = () => {
    onUpdateParameters(parameter);
  };

  const handleSave = () => {
    // TODO: validate all fields
    parameter.setName(name);
    parameter.setID(paramID);
    parameter.setUnits(units);
    // TODO: Check: at least one value before send to parent
    onGetParameter();
  };

  useEffect(() => {
    handleSave();
  }, [name, units]);

  const updateValues = (val) => {
    parameter.setValues(val);
    //WARNING: ValueSet is not a set, more than one same value can be added
    //TODO: Refactor so that only one value can be added once
    setValuesSet([...valuesSet, val]);
    onGetParameter();
  };

  return (
    <div>
      {showRemove && <button onClick={onRemove}>Remove Parameter</button>}
      <p className="text-red-500">Name for parameter</p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-white text-black"
      />
      <p className="text-red-500">Units</p>
      <input
        type="text"
        value={units}
        onChange={(e) => setUnits(e.target.value)}
        className="bg-white text-black"
      />
      <AddValue onUpdateValues={updateValues} />
      {valuesSet &&
        valuesSet.map((e) => {
          return <p key={e}>{e}</p>;
        })}
    </div>
  );
}
