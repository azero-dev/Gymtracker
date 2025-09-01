import { useState, useRef, useEffect } from "preact/hooks";
import { Template } from "../../../models/Template.js";
import AddParameter from "./AddParameter";

// TODO: Currently, add and remove parameters does not update the template object,
// only the ID array. Fix so that the template object is always up to date.

export default function CreateTemplate({ onClose, useTemplate }) {
  const template = useRef(new Template()).current;
  const [name, setName] = useState("");
  const [parameterIDs, setParameterIDs] = useState([crypto.randomUUID()]);
  const { createTemplate } = useTemplate;

  const saveName = () => {
    // TODO: validate name before saving
    template.setName(name);
  };

  const handleSave = async () => {
    if (!template || !template.name || !template.parameters) {
      alert("Template is incomplete");
      return;
    }
    const templateData = {
      id: template.id,
      name: template.name,
      // highlights: Array.from(template.getHighlights()),
      highlights: [],
      parameters: template
        .getParametersArray()
        // .filter((param) => param != null)
        .map((param) => ({
          id: param.getID(),
          name: param.getName(),
          units: param.getUnits(),
          values: param.getValuesArray(),
        })),
    };
    const result = await createTemplate(templateData);
    if (result.success) {
      alert("Template saved successfully!");
      onClose();
    } else {
      console.error("Save failed:", result.error);
      alert(`Failed to save: ${result.error}`);
    }
  };

  useEffect(() => {
    saveName();
  }, [name]);

  // Get data from parameters
  const updateParameters = (param) => {
    // FIX: If parameter exists, update it. If not, add it./
    if (template.getParameters().has(param.id)) {
      template.setParameter(param);
      // console.log(template);
    } else {
      template.setParameter(param);
    }
  };

  const addParameter = () => {
    const newID = crypto.randomUUID();
    setParameterIDs((prevIDs) => [...prevIDs, newID]);
  };

  const removeParameter = (id) => {
    if (parameterIDs.length > 1) {
      setParameterIDs((prevIDs) => prevIDs.filter((paramID) => paramID !== id));
      template.getParameters().delete(id);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 p-2.5">
      <h1 className="text-4xl text-center">Create new template</h1>
      <input
        type="text"
        value={name}
        placeholder="Name your template"
        onChange={(e) => setName(e.target.value)}
        className="bg-white text-black text-xl text-center"
      />
      {parameterIDs.map((paramID) => {
        return (
          <AddParameter
            onUpdateParameters={updateParameters}
            paramID={paramID}
            onRemove={() => removeParameter(paramID)}
            showRemove={parameterIDs.length > 1}
          />
        );
      })}
      <button onClick={addParameter}>Add Parameter</button>
      {/* TODO: */}
      <p>Select 3 main parameters</p>
      <button onClick={handleSave}>Save Template</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
