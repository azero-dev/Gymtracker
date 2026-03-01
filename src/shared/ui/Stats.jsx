import { useSessions } from "../../features/sessions/hooks/useSessions.js";
import ProgressChart from "../../features/stats/components/ProgressChart.jsx";

export default function Stats() {
    const { sessions, loading } = useSessions();

    return (
        <div className="w-full h-[35vh] md:h-[40vh] bg-[#000000] block">
            {loading ? (
                <div className="w-full h-full flex items-center justify-center text-[#535458]">
                    <span className="animate-pulse">Loading stats...</span>
                </div>
            ) : (
                <ProgressChart sessions={sessions} />
            )}
        </div>
    );
}
