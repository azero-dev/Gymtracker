import { getSessions } from "./getSessions.js";
import { saveSession } from "./saveSession.js";
import { updateSession } from "./updateSession.js";
import { deleteSession } from "./deleteSession.js";

export const sessionApi = {
    get: getSessions,
    post: saveSession,
    put: updateSession,
    delete: deleteSession,
};
