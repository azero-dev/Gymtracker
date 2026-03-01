import { useState } from "preact/hooks";
import { useSessions } from "../hooks/useSessions.js";
import SessionList from "./SessionList.jsx";
import CreateSession from "./CreateSession.jsx";
import AddButton from "../../../shared/ui/AddButton.jsx";
import LoadingScreen from "../../../shared/ui/LoadingScreen.jsx";
import Modal from "../../../shared/ui/Modal.jsx";

export default function SessionDashboard() {
    const {
        sessions,
        loading,
        error,
        saving,
        deleting,
        updating,
        loadSessions,
        createSession,
        updateSession,
        deleteSession,
    } = useSessions();
    const [isCreatingSession, setIsCreatingSession] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [selectedRoutine, setSelectedRoutine] = useState("All");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const routineNames = Array.from(new Set(sessions.map((s) => s.name)));

    const filteredSessions = sessions.filter((s) => {
        if (selectedRoutine !== "All" && s.name !== selectedRoutine) return false;

        const sessionDate = new Date(s.created_at);
        sessionDate.setHours(0, 0, 0, 0);

        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (sessionDate < start) return false;
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (sessionDate > end) return false;
        }

        return true;
    });

    const handleReset = () => {
        setSelectedRoutine("All");
        setStartDate("");
        setEndDate("");
    };

    const handleCreateClick = () => {
        setIsCreatingSession(true);
        setEditingSession(null);
    };

    const handleEditClick = (session) => {
        setEditingSession(session);
        setIsCreatingSession(true);
    };

    const handleClose = () => {
        setIsCreatingSession(false);
        setEditingSession(null);
    };

    const handleDeleteRequest = (sessionId) => {
        const session = sessions.find(s => s.id === sessionId);
        setDeleteConfirm({ id: sessionId, name: session?.name || "this session" });
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirm) {
            deleteSession(deleteConfirm.id);
            setDeleteConfirm(null);
        }
    };

    return (
        <div className="flex flex-col gap-4 min-h-[300px] mt-2">

            <Modal
                isOpen={!!deleteConfirm}
                title="Delete Session"
                message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
                onClose={() => setDeleteConfirm(null)}
                buttons={[
                    { label: "Cancel", onClick: () => setDeleteConfirm(null) },
                    { label: "Delete", variant: "danger", onClick: handleDeleteConfirm },
                ]}
            />

            {error && (
                <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 p-3 rounded-xl text-[#ef4444] text-center text-sm max-w-md mx-auto">
                    Error getting the info. Please try again.
                </div>
            )}

            {loading ? (
                <LoadingScreen />
            ) : isCreatingSession ? (
                <div className="w-full animate-in fade-in slide-in-from-top-4 duration-300">
                    <CreateSession
                        onClose={handleClose}
                        useSession={{ createSession, updateSession }}
                        editingSession={editingSession}
                    />
                </div>
            ) : (
                <div className="w-full flex flex-col gap-4 items-center">
                    {/* Filters Toggle */}
                    <div className="flex justify-center w-full">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 text-xs md:text-sm ${showFilters
                                    ? "bg-[#7bf4e1]/10 border-[#7bf4e1]/50 text-[#7bf4e1]"
                                    : "bg-[#111114] border-[#2a2a2e] text-[#535458] hover:border-[#7bf4e1]/30 hover:text-[#f9f9f9]"
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            <span className="font-medium">{showFilters ? "Hide Filters" : "Filters"}</span>
                            {(selectedRoutine !== "All" || startDate || endDate) && !showFilters && (
                                <span className="flex h-2 w-2 rounded-full bg-[#7bf4e1] animate-pulse"></span>
                            )}
                        </button>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="flex flex-col gap-4 bg-[#111114] backdrop-blur-md p-4 rounded-2xl border border-[#2a2a2e] w-full max-w-4xl animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Routine Filter */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-semibold text-[#535458] uppercase tracking-wider px-1">Routine</label>
                                    <div className="relative">
                                        <select
                                            className="appearance-none w-full bg-[#000000]/50 text-[#f9f9f9] rounded-xl pl-3 pr-8 py-2.5 text-sm font-medium border border-[#2a2a2e] focus:outline-none focus:border-[#7bf4e1] transition-all hover:border-[#7bf4e1]/30 cursor-pointer"
                                            value={selectedRoutine}
                                            onChange={(e) => setSelectedRoutine(e.currentTarget.value)}
                                        >
                                            <option value="All">All Routines</option>
                                            {routineNames.map((name) => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#535458]">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Start Date */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-semibold text-[#535458] uppercase tracking-wider px-1">From</label>
                                    <input
                                        type="date"
                                        className="w-full bg-[#000000]/50 text-[#f9f9f9] rounded-xl px-3 py-2.5 text-sm font-medium border border-[#2a2a2e] focus:outline-none focus:border-[#7bf4e1] transition-all hover:border-[#7bf4e1]/30 cursor-pointer [color-scheme:dark]"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.currentTarget.value)}
                                    />
                                </div>

                                {/* End Date */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-semibold text-[#535458] uppercase tracking-wider px-1">To</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="date"
                                            className="flex-1 bg-[#000000]/50 text-[#f9f9f9] rounded-xl px-3 py-2.5 text-sm font-medium border border-[#2a2a2e] focus:outline-none focus:border-[#7bf4e1] transition-all hover:border-[#7bf4e1]/30 cursor-pointer [color-scheme:dark]"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.currentTarget.value)}
                                        />
                                        {(selectedRoutine !== "All" || startDate || endDate) && (
                                            <button
                                                onClick={handleReset}
                                                className="p-2.5 bg-[#17181c] hover:bg-[#ef4444]/10 text-[#535458] hover:text-[#ef4444] rounded-xl transition-all border border-[#2a2a2e] hover:border-[#ef4444]/30"
                                                title="Reset all filters"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* List — 2 cols on mobile, 3 on md, 4 on lg */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 w-full items-stretch animate-in fade-in zoom-in duration-300">
                        <AddButton onClick={handleCreateClick} />
                        <SessionList
                            useSessions={{
                                sessions: filteredSessions,
                                updating,
                                deleting,
                                deleteSession: handleDeleteRequest,
                                loading,
                                error,
                            }}
                            onEdit={handleEditClick}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
