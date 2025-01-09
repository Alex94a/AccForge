import fs from 'fs';
import path from 'path';

export class ProfileManager {
    static PROFILES_DIR = path.join(process.cwd(), 'data', 'profiles');

    // Initializes the profiles directory if it doesn't exist
    static initializeProfilesDir() {
        if (!fs.existsSync(this.PROFILES_DIR)) {
            fs.mkdirSync(this.PROFILES_DIR, { recursive: true });
        }
    }

    // Returns the path for a specific sessionId
    async getProfilePath(sessionId) {
        const profilePath = path.join(ProfileManager.PROFILES_DIR, sessionId);
        return profilePath;
    }

    static deleteProfile(sessionId) {
        const profilePath = path.join(ProfileManager.PROFILES_DIR, sessionId);
        if (fs.existsSync(profilePath)) {
            fs.rmdirSync(profilePath, { recursive: true });
        }
    }
}
