import { useEffect, useState } from "preact/hooks";
import { sessionApi } from "../api/index.js";

export const useSessions = (initialFilters = {}) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [updating, setUpdating] = useState(null);
    // WARNING: error is set as a placeholder. Set proper error handling later.
    const [error, setError] = useState(null);

    const loadSessions = async (filters = initialFilters) => {
        setLoading(true);
        try {
            const result = await sessionApi.get(filters);
            if (result.success) {
                const sessionsArray = result.data.sessions || [];
                setSessions(sessionsArray);
            } else {
                setSessions([]);
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            setSessions([]);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const createSession = async (sessionData) => {
        setSaving(true);
        try {
            const result = await sessionApi.post(sessionData);
            if (result.success) {
                await loadSessions();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    const deleteSession = async (sessionId) => {
        setDeleting(sessionId);
        try {
            const result = await sessionApi.delete(sessionId);
            if (result.success) {
                await loadSessions();
                return { success: true, message: result.message };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err) {
            console.error("Delete session failed:", err);
            return { success: false, error: err.message };
        } finally {
            setDeleting(null);
        }
    };

    const updateSession = async (sessionData) => {
        setSaving(true);
        try {
            const result = await sessionApi.put(sessionData);
            if (result.success) {
                await loadSessions();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        loadSessions();
    }, []);

    return {
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
    };
};
