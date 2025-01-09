import { plugin } from 'selenium-with-fingerprints';
import { Options } from 'selenium-webdriver/chrome.js';
import { Logger } from '../utils/logger.js';
import { FingerprintManager } from '../services/fingerprint.js';
import { ProfileManager } from '../services/profile.js';
import { ProxyManager } from '../services/proxy.js';
import { fingerprintServiceKey } from '../../config.js'


/**
 * Session class to initialize and manage a Selenium session with a configured browser fingerprint.
 */
export class Session {
    /**
     * Creates an instance of the Session class.
     * 
     * @param {string} sessionId - The unique identifier for the session.
     * @param {Object} config - Configuration object containing options for the session.
     */
    constructor(sessionId, config) {
        this.sessionId = sessionId;  // Session ID for this particular session
        this.config = config;        // Configuration passed for session initialization
        this.driver = null;          // Selenium WebDriver instance (initialized later)
        this.logger = new Logger('Session'); // Logger for session activities
        this.fingerprintManager = new FingerprintManager(); // Manager for handling fingerprints
        this.proxyManager = new ProxyManager();  // Manager for handling proxies
        this.profileManager = new ProfileManager(); // Manager for handling profiles
    }

    /**
     * Initializes the session by setting up the driver with necessary configurations.
     * Fetches the profile path and configures various session options.
     */
    async initialize() {
        this.logger.info('Initializing session...');
        
        // Sets the service key for the fingerprint plugin (empty by default)
        plugin.setServiceKey(fingerprintServiceKey);

        // Fetch the profile path based on the session ID\
        const profilePath = await this.profileManager.getProfilePath(this.sessionId);

        // Configure browser options based on the profile path and provided configuration
        const options = await this.configureOptions(profilePath, this.config);
        
        // Launch the driver with configured options
        this.driver = await plugin.launch({ options });
        this.logger.info('Session initialized.');
    }

    /**
     * Configures the WebDriver options for the session.
     * 
     * @param {string} profilePath - The path to the browser profile directory.
     * @param {Object} config - The configuration object for the session.
     * @returns {Options} - Configured options for the Selenium WebDriver instance.
     */
    async configureOptions(profilePath, config) {
        const options = new Options();
        
        // Set the user data directory to the provided profile path
        options.addArguments([`--user-data-dir=${profilePath}`]);

        // Enable headless mode if specified in the configuration
        if (config.headless) {
            options.addArguments('--headless');
        }

        // Configure proxy if specified in the configuration
        if (config.proxy && config.proxy !== 'default') {
            if (config.proxy == 'database') {
                config.proxy = await this.proxyManager.readAndRotateProxy();
            } 

            if (config.proxy.match(/^(.*?):(.*)@/)) {
                // Use proxy with authentication details if specified
                await plugin.useProxy(config.proxy, {
                    changeTimezone: true, // Modify the timezone when using the proxy
                    changeGeolocation: true, // Modify the geolocation when using the proxy
                });
            } else {
                // Use proxy server directly if no authentication is needed
                options.addArguments(`--proxy-server=${config.proxy}`);
            }
        }

        // Configure the browser fingerprint if specified
        if (config.fingerprint && config.fingerprint !== 'default') {
            let fingerprint;

            if (config.fingerprint === 'fetch') {
                // Fetch fingerprint from the plugin if 'fetch' option is chosen
                fingerprint = await plugin.fetch({ tags: ['Microsoft Windows', 'Chrome'] });
            } else if (config.fingerprint === 'database') {
                // Use the fingerprint from the database (stored fingerprint)
                fingerprint = JSON.stringify(await this.fingerprintManager.fetchAndUpdateFingerprint());
            } else {
                // Use the provided fingerprint directly from config
                fingerprint = config.fingerprint;
            }
            // Apply the fingerprint to the session using the plugin
            await plugin.useFingerprint(fingerprint);
        }

        return options; // Return the configured options
    }

    /**
     * Stops the session by quitting the Selenium WebDriver.
     */
    async quit() {
        this.logger.info('Stopping session...');
        await this.driver?.quit(); // Quit the WebDriver session if available
        this.logger.info('Session stopped.');
    }
}
