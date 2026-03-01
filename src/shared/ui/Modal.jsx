export default function Modal({ isOpen, title, message, buttons = [], onClose }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm"></div>

            {/* Modal */}
            <div
                className="relative bg-[#17181c] border border-[#2a2a2e] rounded-2xl p-5 md:p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <h2 className="text-base md:text-lg font-bold text-[#f9f9f9] mb-2">{title}</h2>
                )}
                {message && (
                    <p className="text-sm text-[#535458] mb-5 leading-relaxed">{message}</p>
                )}

                {/* Buttons */}
                {buttons.length > 0 && (
                    <div className="flex gap-2">
                        {buttons.map((btn, i) => (
                            <button
                                key={i}
                                onClick={btn.onClick}
                                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all active:scale-95 ${btn.variant === "danger"
                                        ? "bg-[#ef4444] text-white hover:brightness-110"
                                        : btn.variant === "primary"
                                            ? "bg-[#7bf4e1] text-[#000000] hover:brightness-110"
                                            : "bg-[#2a2a2e] text-[#f9f9f9] hover:bg-[#353539]"
                                    }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
