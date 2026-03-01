export default function Menu({ isMenuOpen, setIsMenuOpen }) {
    return (
        <div className="py-3 px-4 md:py-6 md:px-8 flex items-center justify-center">
            <div className="bg-[#17181c] p-1 rounded-2xl flex gap-1 border border-[#2a2a2e] shadow-lg w-full max-w-xs md:max-w-none md:w-auto">
                <button
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex-1 md:flex-none px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-bold text-sm transition-all duration-300 ${!isMenuOpen
                        ? "bg-[#7bf4e1] text-[#000000] shadow-lg"
                        : "text-[#535458] hover:bg-[#2a2a2e]/50 hover:text-[#f9f9f9]"
                        }`}
                >
                    Routines
                </button>
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className={`flex-1 md:flex-none px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-bold text-sm transition-all duration-300 ${isMenuOpen
                        ? "bg-[#7bf4e1] text-[#000000] shadow-lg"
                        : "text-[#535458] hover:bg-[#2a2a2e]/50 hover:text-[#f9f9f9]"
                        }`}
                >
                    Sessions
                </button>
            </div>
        </div>
    );
}
