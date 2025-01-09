import { Logger } from './src/utils/logger.js';
import { handleError } from './src/utils/error.js';
import { createChannelBio, generateAccountData, saveAccount } from './src/services/account.js';
import { task } from './config.js';
import { register } from './src/tasks/register.js';
import { createAndUpdateChannel } from './src/tasks/channel.js';
import { SessionManager } from './src/services/session.js';

const logger = new Logger('Executor');

export class AccountExecutor {
    constructor() {
        this.sessionManager = new SessionManager();
        this.accounts = [];
        this.failedAccounts = [];
    }

    async initialize() {
        try {
            await this.sessionManager.initialize();
            logger.info('Session manager initialized successfully');
        } catch (error) {
            handleError(error, { action: 'Initializing session manager' }, logger);
            throw error;
        }
    }

    async execute(accountCount = 10) {
        try {
            logger.info('Starting account creation process');

            for (let i = 0; i < accountCount; i++) {
                const sessionId = `session_${Date.now()}_${i}`;
                const accountData = generateAccountData();

                try {
                    logger.info(`Creating account with login: ${accountData.login}`);
                    
                    // Create a new session for this account
                    const config = {
                        'fingerprint': 'fetch',
                        'proxy': 'database',
                        'headless': false
                    }
                    const { session, actions } = await this.sessionManager.createSession(sessionId, config);
                    
                    // Register the account
                    const phone = await register(session, actions, accountData);
                    accountData.phone = phone;

                    let accountStatus = 'google';

                    // Create YouTube channel if required
                    if (task.youtubeChannel.isRequired) {
                        const youtubeChannel = await createChannelBio(accountData.login);
                        accountData.youtubeChannel = youtubeChannel;

                        const channelCreated = await createAndUpdateChannel(
                            session, 
                            actions,
                            youtubeChannel.studioUrl,
                            youtubeChannel.title,
                            youtubeChannel.description,
                            youtubeChannel.logoPath
                        );

                        if (channelCreated) {
                            accountStatus = 'youtube';
                        }
                    }

                    // Save account and update status
                    await saveAccount(accountData, accountStatus);
                    this.accounts.push(accountData);
                    
                    logger.info(`Account created successfully: ${accountData.login}`);

                    // Clean up session
                    await this.sessionManager.closeSession(sessionId);

                } catch (error) {
                    handleError(error, { 
                        action: 'Creating account',
                        login: accountData.login,
                        sessionId: sessionId
                    }, logger);

                    await saveAccount(accountData, 'error');
                    this.failedAccounts.push(accountData);

                    // Ensure session is closed even if there's an error
                    try {
                        await this.sessionManager.closeSession(sessionId);
                    } catch (closeError) {
                        logger.error(`Error closing session ${sessionId}: ${closeError.message}`);
                    }
                }

                // Add delay between account creations
                await new Promise(resolve => setTimeout(resolve, 5000));
            }

            logger.info(`Account creation process completed. ${this.accounts.length} accounts created successfully.`);
            
            return {
                successful: this.accounts,
                failed: this.failedAccounts
            };

        } catch (error) {
            handleError(error, { action: 'Executor process' }, logger);
            throw error;
        }
    }

    getResults() {
        return {
            successful: [...this.accounts],
            failed: [...this.failedAccounts],
            totalAttempted: this.accounts.length + this.failedAccounts.length
        };
    }
}

// Usage example:
export async function runAccountCreation(accountCount = 10) {
    const executor = new AccountExecutor();
    
    try {
        await executor.initialize();
        await executor.execute(accountCount);
        
        return executor.getResults();
    } catch (error) {
        logger.error(`Account creation failed: ${error.message}`);
        throw error;
    }
}