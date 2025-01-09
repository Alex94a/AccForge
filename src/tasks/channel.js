import { Logger } from '../utils/logger.js';
import path from 'path';

// xpath_dict.js
export const XPATHS = {
    channel: {
        titleInput: '//*[@id="input-1"]/input',
        createButton: '//*[@id="create-channel-button"]/yt-button-shape/button',
    },
    description: {
        dismissButton: '//*[@id="dismiss-button"]',
        closeButton: '//*[@id="close-button"]',
        textBox: '//*[@id="textbox"]',
        publishButton: '//*[@id="publish-button"]/ytcp-button-shape/button',
    },
    logo: {
        dismissButton: '//*[@id="dismiss-button"]',
        closeButton: '//*[@id="close-button"]',
        fileInput: '//*[@id="file-selector"]',
        doneButton: '//*[@id="done-button"]/ytcp-button-shape/button',
        publishButton: '//*[@id="publish-button"]/ytcp-button-shape/button',
    }
};


const logger = new Logger('createAndUpdateChannel');

export async function createAndUpdateChannel(session, actions, studioUrl, title, description, logoPath) {
    try {
        logger.info('Creating channel...');
        await actions.driver.get('https://www.youtube.com/');
        await actions.randomDelay(2);
        await actions.driver.get('https://studio.youtube.com/');
        await actions.randomDelay(5);

        await actions.inputElement(XPATHS.channel.titleInput, title, true);
        await actions.randomDelay(4);

        logger.info('Channel title created.');

        const clickAndWaitPromise = actions.clickElement(XPATHS.channel.createButton)
            .then(() => new Promise(resolve => setTimeout(resolve, 20000)));

        const stopScriptPromise = new Promise(resolve => setTimeout(resolve, 15000))
            .then(async () => {
                await actions.driver.executeScript("window.stop();");
            });

        await Promise.allSettled([clickAndWaitPromise, stopScriptPromise]);

        let currentUrl = await actions.driver.getCurrentUrl();
        let channelId = currentUrl.split("/").pop();

        logger.info(`Channel created with ID: ${channelId}`);

        if (description) {
            logger.info('Updating channel description...');
            await actions.driver.get(`${studioUrl}/editing/details`);
            await actions.randomDelay(2);

            try {
                await actions.clickElement(XPATHS.description.dismissButton);
            } catch { }

            try {
                await actions.clickElement(XPATHS.description.closeButton);
            } catch { }

            await actions.randomDelay(0.5);
            await actions.hardInputElement(XPATHS.description.textBox, description);
            await actions.randomDelay(0.5);

            await actions.inputElement(XPATHS.description.textBox, 'ENTER');
            await actions.randomDelay(1);

            await actions.clickElement(XPATHS.description.publishButton);
            await actions.randomDelay(8);

            logger.info('Channel description updated.');
        }

        if (logoPath) {
            logger.info('Updating channel logo...');
            await actions.driver.get(`${studioUrl}/editing/images`);
            await actions.randomDelay(2);

            try {
                await actions.clickElement(XPATHS.logo.dismissButton);
            } catch { }

            try {
                await actions.clickElement(XPATHS.logo.closeButton);
            } catch { }

            await actions.randomDelay(0.5);
            await actions.inputElement(XPATHS.logo.fileInput, path.resolve(logoPath));
            await actions.randomDelay(5);

            await actions.clickElement(XPATHS.logo.doneButton);
            await actions.randomDelay(1);

            await actions.clickElement(XPATHS.logo.publishButton);
            await actions.randomDelay(15);

            logger.info('Channel logo updated.');
        }

        logger.info('All requested updates completed.');
        return channelId;
    } catch (error) {
        logger.error(`Failed to create and update channel: ${error.message}`);
        throw error;
    }
}
