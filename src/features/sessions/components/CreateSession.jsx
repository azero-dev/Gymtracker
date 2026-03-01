import { useState, useEffect } from "preact/hooks";
import { useTemplates } from "../../templates/hooks/useTemplates.js";

export default function CreateSession({ onClose, useSession, editingSession }) {
    const isEditing = !!editingSession;
    const [selectedTemplateId, setSelectedTemplateId] = useState(editingSession?.template_id || "");
    const [sessionDate, setSessionDate] = useState("");
    const [paramValues, setParamValues] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const { createSession, updateSession } = useSession;
    const { templates, loading: loadingTemplates } = useTemplates();

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

    useEffect(() => {
        if (isEditing) {
            if (editingSession.parameters) {
                const initialValues = {};
                editingSession.parameters.forEach(param => {
                    initialValues[param.id] = param.value;
                });
                setParamValues(initialValues);
            }
            if (editingSession.created_at) {
                const dateObj = new Date(editingSession.created_at);
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                const hours = String(dateObj.getHours()).padStart(2, '0');
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                setSessionDate(`${year}-${month}-${day}T${hours}:${minutes}`);
            }
        }
    }, [isEditing, editingSession]);

    const handleTemplateChange = (e) => {
        const templateId = e.target.value;
        setSelectedTemplateId(templateId);
        if (!isEditing || templateId !== editingSession.template_id) {
            setParamValues({});
        }
    };

    const handleParamValueChange = (paramId, value) => {
        setParamValues(prev => ({
            ...prev,
            [paramId]: value
        }));
    };

    const handleSave = async () => {
        setError(null);
        if (!selectedTemplateId) {
            setError("Please select a routine");
            return;
        }

        const currentTemplate = templates.find(t => t.id === selectedTemplateId);

        setSaving(true);

        const values = Object.entries(paramValues).map(([paramId, val]) => ({
            parameter_id: paramId,
            value: val
        }));

        const sessionData = {
            id: isEditing ? editingSession.id : crypto.randomUUID(),
            name: currentTemplate.name,
            template_id: selectedTemplateId,
            values: values
        };

        if (isEditing && sessionDate) {
            sessionData.created_at = new Date(sessionDate).toISOString();
        }

        let result;
        if (isEditing) {
            result = await updateSession(sessionData);
        } else {
            result = await createSession(sessionData);
        }

        setSaving(false);
        if (result.success) {
            onClose();
        } else {
            setError(result.error);
        }
    };

    if (loadingTemplates) {
        return <div className="text-[#f9f9f9] text-center p-8">Loading routines...</div>;
    }

    return (
        <div className="flex flex-col gap-4 p-4 md:p-6 bg-[#17181c] rounded-2xl w-full max-w-2xl mx-auto border border-[#2a2a2e] col-span-full">
            <h1 className="text-xl md:text-2xl text-center font-bold text-[#f9f9f9]">
                {isEditing ? "Edit Session" : "New Session"}
            </h1>

            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-medium text-[#535458] px-1 text-center uppercase tracking-wider">Routine</label>
                    <select
                        value={selectedTemplateId}
                        onChange={handleTemplateChange}
                        className="bg-[#000000] text-[#f9f9f9] text-sm md:text-base p-3 rounded-xl border border-[#2a2a2e] focus:border-[#7bf4e1] focus:outline-none transition-colors text-center appearance-none cursor-pointer disabled:opacity-50"
                        disabled={saving || isEditing}
                    >
                        <option value="">-- Choose a Routine --</option>
                        {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                {isEditing && (
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-medium text-[#535458] px-1 text-center uppercase tracking-wider">Session Date</label>
                        <input
                            type="datetime-local"
                            value={sessionDate}
                            onChange={(e) => setSessionDate(e.target.value)}
                            className="bg-[#000000] text-[#f9f9f9] text-sm md:text-base p-3 rounded-xl border border-[#2a2a2e] focus:border-[#7bf4e1] focus:outline-none transition-colors text-center disabled:opacity-50 [color-scheme:dark]"
                            disabled={saving}
                        />
                    </div>
                )}

                {selectedTemplate && (
                    <div className="mt-2 p-3 md:p-4 bg-[#000000]/50 rounded-xl border border-[#2a2a2e] flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <h2 className="text-sm md:text-base font-semibold text-[#f9f9f9] border-b border-[#2a2a2e] pb-2">
                            {selectedTemplate.name}
                        </h2>
                        {selectedTemplate.parameters.map(param => (
                            <div key={param.id} className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-[#535458] px-1 uppercase tracking-wider">
                                    {param.name} {param.units ? `(${param.units})` : ""}
                                </label>

                                <input
                                    type="text"
                                    value={paramValues[param.id] || ""}
                                    placeholder={`Enter ${param.name.toLowerCase()}`}
                                    onChange={(e) => handleParamValueChange(param.id, e.target.value)}
                                    className="bg-[#000000] text-[#f9f9f9] p-3 rounded-xl border border-[#2a2a2e] focus:border-[#7bf4e1] focus:outline-none text-sm transition-all"
                                    disabled={saving}
                                />

                                {param.values && param.values.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 px-1">
                                        <span className="text-[10px] text-[#535458] w-full mb-0.5">Suggestions:</span>
                                        {param.values.map(val => (
                                            <button
                                                key={`${param.id}-${val}`}
                                                type="button"
                                                onClick={() => handleParamValueChange(param.id, val)}
                                                className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${paramValues[param.id] === val
                                                    ? "bg-[#7bf4e1]/20 border-[#7bf4e1]/50 text-[#7bf4e1]"
                                                    : "bg-[#17181c] border-[#2a2a2e] text-[#535458] hover:border-[#7bf4e1]/30 hover:text-[#f9f9f9]"
                                                    }`}
                                                disabled={saving}
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] p-3 rounded-xl text-xs text-center">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-2 pt-3 border-t border-[#2a2a2e]">
                <button
                    onClick={handleSave}
                    disabled={saving || !selectedTemplateId}
                    className={`p-3 rounded-xl font-bold text-sm md:text-base transition-all ${(saving || !selectedTemplateId)
                        ? "bg-[#17181c] text-[#535458] cursor-not-allowed"
                        : "bg-[#7bf4e1] text-[#000000] active:scale-95 hover:brightness-110"
                        }`}
                >
                    {saving ? "Saving..." : isEditing ? "Update Session" : "Start Workout"}
                </button>
                <button
                    onClick={onClose}
                    disabled={saving}
                    className="p-3 rounded-xl font-medium text-[#535458] hover:bg-[#2a2a2e]/30 transition-all active:scale-95 text-sm"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
