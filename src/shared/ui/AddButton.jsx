export default function AddButton({ onClick }) {
    return (
        <div
            onClick={onClick}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#2a2a2e] bg-[#111114] hover:bg-[#111114]/80 hover:border-[#7bf4e1]/40 transition-all cursor-pointer group min-h-[120px]"
        >
            <div className="flex flex-col items-center justify-center py-6">
                <div className="bg-[#17181c] p-3 rounded-full mb-3 group-hover:scale-110 transition-transform border border-[#2a2a2e]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#7bf4e1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                <span className="text-[#535458] font-bold tracking-wide uppercase text-[10px] group-hover:text-[#7bf4e1] transition-colors">Add New</span>
            </div>
        </div>
    );
}
