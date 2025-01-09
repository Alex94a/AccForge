import { ProfileManager } from './profile.js';
import { Logger } from '../utils/logger.js';
import { Session } from '../core/Session.js';
import { SessionActions } from '../core/Actions.js';

/**
 * SessionManager class responsible for managing multiple sessions.
 */
export class SessionManager {
    /**
     * Creates an instance of SessionManager.
     * Initializes profiles directory.
     */
    constructor() {
        this.sessions = new Map();  // Stores active sessions by sessionId
        this.logger = new Logger('SessionManager');
    }

    /**
     * Initializes profiles directory (async) before creating sessions.
     * 
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            // Initialize profiles directory asynchronously
            await ProfileManager.initializeProfilesDir();
            this.logger.info('Profiles directory initialized.');
        } catch (error) {
            this.logger.error('Error initializing profiles directory: ' + error.message);
            throw new Error('Profile initialization failed.');
        }
    }

    /**
     * Creates a new session.
     * 
     * @param {string} sessionId - The ID of the session to be created.
     * @param {Object} config - The configuration for the session (optional).
     * @returns {Promise<{ session: Session, actions: SessionActions }>} - The created session and its actions.
     * @throws {Error} - Throws an error if the session already exists or creation fails.
     */
    async createSession(sessionId, config = {}) {
        if (this.sessions.has(sessionId)) {
            throw new Error(`Session ${sessionId} already exists`);
        }

        try {
            // Initialize session with sessionId
            const session = new Session(sessionId, config);
            await session.initialize();
            
            const actions = new SessionActions(session);
            this.sessions.set(sessionId, { session, actions });

            this.logger.info(`Session ${sessionId} created`);

            // Return the session and its actions for user interaction
            return { session, actions };
        } catch (error) {
            this.logger.error(`Failed to create session ${sessionId}: ${error.message}`);
            throw new Error(`Failed to create session ${sessionId}: ${error.message}`);
        }
    }

    /**
     * Closes an existing session.
     * 
     * @param {string} sessionId - The ID of the session to be closed.
     * @returns {Promise<void>}
     * @throws {Error} - Throws an error if the session is not found.
     */
    async closeSession(sessionId) {
        const sessionData = this.sessions.get(sessionId);
        if (!sessionData) {
            throw new Error(`Session ${sessionId} not found`);
        }

        try {
            await sessionData.session.quit();  // Close the session using its `quit` method
            this.sessions.delete(sessionId);  // Remove session from the Map
            this.logger.info(`Session ${sessionId} closed`);
        } catch (error) {
            this.logger.error(`Error closing session ${sessionId}: ${error.message}`);
            throw new Error(`Error closing session ${sessionId}: ${error.message}`);
        }
    }

    /**
     * Retrieves a session by its ID.
     * 
     * @param {string} sessionId - The ID of the session to retrieve.
     * @returns {Object} - The session and its associated actions.
     * @throws {Error} - Throws an error if the session is not found.
     */
    getSession(sessionId) {
        const sessionData = this.sessions.get(sessionId);
        if (!sessionData) {
            throw new Error(`Session ${sessionId} not found`);
        }
        return sessionData;
    }
}
