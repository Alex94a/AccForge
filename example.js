import { SessionManager } from './src/services/session.js'
import { Logger } from './src/utils/logger.js';

// Simple selectors
const SELECTORS = {
    github: {
        navigation: {
            searchInput: '//input[@name="q"]',
            issuesTab: '//span[@data-content="Issues"]',
        }
    }
};

/**
 * Simple GitHub repository visit example
 */
export async function simpleGitHubVisit() {
    const logger = new Logger('GitHubVisit');
    let manager;
    let sessionId;

    try {
        // Initialize the session manager
        manager = new SessionManager();
        await manager.initialize();
        logger.info('Session manager initialized');

        // Create a new session
        sessionId = 'github-visit-session';
        const { actions } = await manager.createSession(sessionId, {
            headless: false,
            proxy: "default",
            fingerprint: "default"
        });
        logger.info('Browser session created successfully');

        try {
            // Navigate to a specific GitHub repository
            logger.info('Navigating to TypeScript repository...');
            await actions.navigate('https://github.com/microsoft/typescript');
            
            // Click on Issues tab
            logger.info('Clicking Issues tab...');
            await actions.click(SELECTORS.github.navigation.issuesTab);
            
            // Take a screenshot
            logger.info('Capturing screenshot of issues page...');
            await actions.screenshot('typescript-issues.png');
            logger.info('Screenshot saved successfully');
            
            // Wait a moment to see the result
            await new Promise(resolve => setTimeout(resolve, 2000));
            logger.info('Visit completed successfully');

        } catch (error) {
            logger.error(`Error during GitHub visit: ${error.message}`);
            throw error;
        } finally {
            if (sessionId) {
                logger.info('Cleaning up session...');
                await manager.closeSession(sessionId);
                logger.info('Session closed successfully');
            }
        }
        
    } catch (error) {
        logger.error(`Fatal error in automation: ${error.stack}`);
        throw error;
    }
}