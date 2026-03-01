import { useState, useEffect } from "preact/hooks";
import { createTemplate, addParameter, removeParameter, templateToJSON } from "../../../entities/template.js";
import AddParameter from "./AddParameter.jsx";

export default function CreateTemplate({ onClose, useTemplate, editingTemplate }) {
    const isEditing = !!editingTemplate;
    const [template, setTemplate] = useState(editingTemplate || createTemplate());
    const [name, setName] = useState(editingTemplate?.name || "");
    const [parameterIDs, setParameterIDs] = useState(
        editingTemplate
            ? editingTemplate.parameters.map(p => p.id)
            : [crypto.randomUUID()]
    );
    const { createTemplate: saveToServer, updateTemplate } = useTemplate;

    const [suggestions, setSuggestions] = useState({});
    const [newSuggestionInputs, setNewSuggestionInputs] = useState({});

    useEffect(() => {
        if (isEditing && editingTemplate.parameters) {
            const initialSuggests = {};
            editingTemplate.parameters.forEach(p => {
                initialSuggests[p.id] = p.values || [];
            });
            setSuggestions(initialSuggests);
        }
    }, [isEditing, editingTemplate]);

    const handleSave = async () => {
        const finalTemplate = { ...template, name: name.trim() };
        if (!finalTemplate.name) {
            alert("Please enter a name for the routine");
            return;
        }
        const paramsArray = Object.values(finalTemplate.parameters);
        if (paramsArray.length === 0) {
            alert("Please add at least one parameter to the routine");
            return;
        }

        if (isEditing) {
            const updatedTemplate = {
                ...editingTemplate,
                parameters: editingTemplate.parameters.map(p => ({
                    ...p,
                    values: suggestions[p.id] || []
                }))
            };
            const result = await updateTemplate(updatedTemplate);
            if (result.success) { onClose(); } else { alert(`Failed to update: ${result.error}`); }
        } else {
            const templateData = templateToJSON(finalTemplate);
            const result = await saveToServer(templateData);
            if (result.success) { onClose(); } else { alert(`Failed to save: ${result.error}`); }
        }
    };

    const handleAddSuggestion = (paramId, value) => {
        if (!value || !value.trim()) return;
        setSuggestions(prev => ({ ...prev, [paramId]: [...(prev[paramId] || []), value.trim()] }));
    };
    const handleRemoveSuggestion = (paramId, valueToRemove) => {
        setSuggestions(prev => ({ ...prev, [paramId]: (prev[paramId] || []).filter(v => v !== valueToRemove) }));
    };
    const handleNewSuggestionInputChange = (paramId, value) => {
        setNewSuggestionInputs(prev => ({ ...prev, [paramId]: value }));
    };
    const handleAddSuggestionAndClear = (paramId) => {
        handleAddSuggestion(paramId, newSuggestionInputs[paramId] || "");
        handleNewSuggestionInputChange(paramId, "");
    };
    const updateParameters = (param) => { setTemplate((prev) => addParameter(prev, param)); };
    const handleAddParameter = () => { setParameterIDs((prevIDs) => [...prevIDs, crypto.randomUUID()]); };
    const handleRemoveParameter = (id) => {
        if (parameterIDs.length > 1) {
            setParameterIDs((prevIDs) => prevIDs.filter((paramID) => paramID !== id));
            setTemplate((prev) => removeParameter(prev, id));
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4 md:p-6 bg-[#17181c] rounded-2xl w-full max-w-2xl mx-auto border border-[#2a2a2e] col-span-full">
            <h1 className="text-xl md:text-2xl text-center font-bold text-[#f9f9f9]">
                {isEditing ? "Edit Routine Suggestions" : "Create New Routine"}
            </h1>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-medium text-[#535458] px-1 text-center uppercase tracking-wider">Routine Name</label>
                    <input
                        type="text"
                        value={name}
                        placeholder="e.g., Push Day, Cardio..."
                        onChange={(e) => !isEditing && setName(e.currentTarget.value)}
                        disabled={isEditing}
                        className="bg-[#000000] text-[#f9f9f9] text-base md:text-lg p-3 rounded-xl border border-[#2a2a2e] focus:border-[#7bf4e1] focus:outline-none transition-colors text-center disabled:opacity-50"
                    />
                </div>

                {!isEditing && (
                    <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-medium text-[#535458] px-1 uppercase tracking-wider">Parameters</label>
                        {parameterIDs.map((paramID) => (
                            <AddParameter
                                key={paramID}
                                onUpdateParameters={updateParameters}
                                paramID={paramID}
                                onRemove={() => handleRemoveParameter(paramID)}
                                showRemove={parameterIDs.length > 1}
                            />
                        ))}
                        <button
                            onClick={handleAddParameter}
                            className="p-2.5 rounded-xl border border-dashed border-[#2a2a2e] text-[#535458] hover:border-[#7bf4e1]/50 hover:text-[#7bf4e1] transition-all text-xs font-medium"
                        >
                            + Add Another Parameter
                        </button>
                    </div>
                )}

                {isEditing && (
                    <div className="flex flex-col gap-4">
                        {editingTemplate.parameters.map(param => (
                            <div key={param.id} className="p-3 bg-[#000000]/50 rounded-xl border border-[#2a2a2e]">
                                <h3 className="text-[#f9f9f9] text-sm font-bold mb-2.5 flex items-center justify-between">
                                    {param.name}
                                    <span className="text-[10px] text-[#535458] font-normal">{param.units || "no units"}</span>
                                </h3>

                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {(suggestions[param.id] || []).map(val => (
                                        <div key={val} className="flex items-center gap-1 bg-[#7bf4e1]/10 text-[#7bf4e1] border border-[#7bf4e1]/20 px-2.5 py-1 rounded-lg text-xs">
                                            {val}
                                            <button onClick={() => handleRemoveSuggestion(param.id, val)} className="text-[#7bf4e1]/60 hover:text-[#ef4444] transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newSuggestionInputs[param.id] || ""}
                                        placeholder="Add suggestion..."
                                        className="bg-[#000000] text-[#f9f9f9] text-xs p-2.5 rounded-xl border border-[#2a2a2e] focus:border-[#7bf4e1] focus:outline-none flex-1"
                                        onInput={(e) => handleNewSuggestionInputChange(param.id, e.currentTarget.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddSuggestionAndClear(param.id); }}
                                    />
                                    <button
                                        onClick={() => handleAddSuggestionAndClear(param.id)}
                                        className="bg-[#7bf4e1] text-[#000000] px-3 rounded-xl text-xs font-bold hover:brightness-110"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2 pt-3 border-t border-[#2a2a2e]">
                <button
                    onClick={handleSave}
                    className="p-3 rounded-xl bg-[#7bf4e1] text-[#000000] font-bold text-sm md:text-base transition-all active:scale-95 hover:brightness-110"
                >
                    {isEditing ? "Update Suggestions" : "Save Routine"}
                </button>
                <button
                    onClick={onClose}
                    className="p-3 rounded-xl font-medium text-[#535458] hover:bg-[#2a2a2e]/30 transition-all active:scale-95 text-sm"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
