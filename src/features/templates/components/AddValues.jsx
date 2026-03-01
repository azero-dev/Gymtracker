import { useState } from "preact/hooks";

export default function AddValues({ onUpdateValues }) {
    const [value, setValue] = useState("");

    const handleClick = () => {
        if (!value.trim()) return;
        onUpdateValues(value.trim());
        setValue("");
    };

    return (
        <div className="flex gap-2">
            <input
                type="text"
                value={value}
                placeholder="Add suggestion..."
                onInput={(e) => setValue(e.currentTarget.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}
                className="bg-[#17181c] text-[#f9f9f9] text-xs p-2.5 rounded-xl border border-[#2a2a2e] focus:border-[#7bf4e1] focus:outline-none flex-1 transition-colors"
                title="Press Enter to add"
            />
            <button
                onClick={handleClick}
                className="bg-[#7bf4e1] text-[#000000] px-3 rounded-xl transition-all active:scale-95 text-xs font-bold hover:brightness-110"
            >
                Add
            </button>
        </div>
    );
}
