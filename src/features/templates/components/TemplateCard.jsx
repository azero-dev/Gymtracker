export default function TemplateCard({ template, deleteTemplate, onEdit }) {
    return (
        <div className="flex flex-col bg-[#111114] rounded-2xl overflow-hidden border border-[#2a2a2e] hover:border-[#7bf4e1]/30 transition-all">
            <div className="p-3.5 md:p-5 flex flex-col gap-3 flex-1">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h3 className="text-sm md:text-base font-bold text-[#f9f9f9] line-clamp-1 flex-1">{template.name}</h3>
                    {/* Desktop-only icon buttons */}
                    <div className="hidden md:flex gap-0.5 shrink-0 ml-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(template); }}
                            className="text-[#535458] hover:text-[#7bf4e1] transition-colors p-1"
                            title="Edit"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); deleteTemplate(template.id); }}
                            className="text-[#535458] hover:text-[#ef4444] transition-colors p-1"
                            title="Delete"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Parameters */}
                <div className="flex-1 flex flex-col gap-2.5">
                    {template.parameters.map((param) => (
                        <div key={param.id} className="flex flex-col gap-1">
                            <span className="text-[13px] md:text-sm text-[#f9f9f9]/80 font-medium">{param.name}
                                {param.units && <span className="text-[10px] text-[#535458] ml-1 font-normal">({param.units})</span>}
                            </span>
                            <div className="flex flex-wrap gap-1">
                                {param.values && param.values.length > 0 ? (
                                    param.values.map((val, idx) => (
                                        <span key={`${param.id}-${idx}`} className="text-[10px] text-[#7bf4e1] bg-[#7bf4e1]/10 px-1.5 py-0.5 rounded">
                                            {val}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-[#535458] text-[10px] italic">No suggestions</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile-only full-width action buttons */}
            <div className="flex md:hidden border-t border-[#2a2a2e]">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(template); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[#535458] hover:text-[#7bf4e1] hover:bg-[#7bf4e1]/5 transition-all text-xs font-medium border-r border-[#2a2a2e]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); deleteTemplate(template.id); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[#535458] hover:text-[#ef4444] hover:bg-[#ef4444]/5 transition-all text-xs font-medium"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    );
}
