import { useEffect, useState } from "preact/hooks";
import { createParameter } from "../../../entities/parameter.js";
import AddValues from "./AddValues.jsx";

export default function AddParameter({
    onUpdateParameters,
    paramID,
    onRemove,
    showRemove,
}) {
    const [parameter, setParameter] = useState(() =>
        createParameter({ id: paramID }),
    );
    const [name, setName] = useState("");
    const [units, setUnits] = useState("");
    const [valuesSet, setValuesSet] = useState([]);

    const onGetParameter = (currentParameter) => {
        onUpdateParameters(currentParameter);
    };

    useEffect(() => {
        const updatedParam = { ...parameter, name, units, values: valuesSet };
        setParameter(updatedParam);
        onGetParameter(updatedParam);
    }, [name, units, valuesSet]);

    const updateValues = (val) => {
        if (valuesSet.includes(val)) return;
        setValuesSet((prev) => [...prev, val]);
    };

    const removeValue = (valToRemove) => {
        setValuesSet((prev) => prev.filter(v => v !== valToRemove));
    };

    return (
        <div className="p-3 md:p-4 bg-[#000000]/50 rounded-xl border border-[#2a2a2e] flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-[#535458] uppercase tracking-widest">New Parameter</span>
                {showRemove && (
                    <button onClick={onRemove} className="text-[#535458] hover:text-[#ef4444] transition-colors p-1" title="Remove">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-[#535458] px-1">Name</label>
                    <input
                        type="text" value={name} placeholder="e.g. Weight, Reps"
                        onInput={(e) => setName(e.currentTarget.value)}
                        className="bg-[#17181c] text-[#f9f9f9] p-2.5 rounded-xl border border-[#2a2a2e] focus:border-[#7bf4e1] focus:outline-none text-sm transition-all"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-[#535458] px-1">Units</label>
                    <input
                        type="text" value={units} placeholder="e.g. kg, mins"
                        onInput={(e) => setUnits(e.currentTarget.value)}
                        className="bg-[#17181c] text-[#f9f9f9] p-2.5 rounded-xl border border-[#2a2a2e] focus:border-[#7bf4e1] focus:outline-none text-sm transition-all"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-[#535458] px-1">Quick Suggestions</label>
                <AddValues onUpdateValues={updateValues} />
                <div className="flex flex-wrap gap-1.5">
                    {valuesSet.map((v) => (
                        <div key={v} className="flex items-center gap-1 bg-[#17181c] text-[#7bf4e1] border border-[#2a2a2e] px-2 py-1 rounded-lg text-xs group/val">
                            {v}
                            <button onClick={() => removeValue(v)} className="text-[#535458] hover:text-[#ef4444] opacity-0 group-hover/val:opacity-100 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
