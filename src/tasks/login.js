import { Logger } from '../utils/logger.js';

const XPATHS_LOGIN = {
    loginInput: '//*[@id="identifierId"]',
    nextButton: '//*[@id="identifierNext"]/div/button',
    passwordInput: '//*[@id="password"]/div[1]/div/div[1]/input',
    passwordNextButton: '//*[@id="passwordNext"]/div/button',
    signInButton: '//*[@id="signIn"]/div/button'
};

const logger = new Logger('Login');

export async function login(session, actions, loginData) {
    try {
        logger.info('Starting login process');
        await actions.navigate('https://accounts.google.com/');
        await actions.randomDelay(2);

        logger.info('Entering login credentials');
        await actions.input(XPATHS_LOGIN.loginInput, loginData.username);
        await actions.click(XPATHS_LOGIN.nextButton);
        await actions.randomDelay(2);

        await actions.input(XPATHS_LOGIN.passwordInput, loginData.password);
        await actions.click(XPATHS_LOGIN.passwordNextButton);
        await actions.randomDelay(3);

        logger.info('Login completed successfully');
    } catch (error) {
        logger.error(`Login failed: ${error.message}`);
    }
}
