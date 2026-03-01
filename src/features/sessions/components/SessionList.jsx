import { Fragment } from "preact";
import SessionCard from "./SessionCard.jsx";

export default function SessionList({ useSessions, onEdit }) {
    const { sessions, updating, deleting, deleteSession, loading, error } =
        useSessions;
    // TODO: implement updating

    if (loading) {
        return (
            <div>
                <p>Loading sessions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <p>Error loading sessions: {error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <Fragment>
            {!loading &&
                Array.isArray(sessions) &&
                sessions.map((session) => {
                    return (
                        <SessionCard
                            key={session.id}
                            session={session}
                            deleteSession={deleteSession}
                            onEdit={onEdit}
                        />
                    );
                })}
        </Fragment>
    );
}
