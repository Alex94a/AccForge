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
        await session.driver.get('https://www.youtube.com/');
        
        await session.driver.get('https://studio.youtube.com/');
        

        await actions.input(XPATHS.channel.titleInput, title, true);
        

        logger.info('Channel title created.');

        const clickAndWaitPromise = actions.click(XPATHS.channel.createButton)
            .then(() => new Promise(resolve => setTimeout(resolve, 20000)));

        const stopScriptPromise = new Promise(resolve => setTimeout(resolve, 15000))
            .then(async () => {
                await session.driver.executeScript("window.stop();");
            });

        await Promise.allSettled([clickAndWaitPromise, stopScriptPromise]);

        let currentUrl = await session.driver.getCurrentUrl();
        let channelId = currentUrl.split("/").pop();

        logger.info(`Channel created with ID: ${channelId}`);

        if (description) {
            logger.info('Updating channel description...');
            await session.driver.get(`${studioUrl}/editing/details`);
            

            try {
                await actions.click(XPATHS.description.dismissButton);
            } catch { }

            try {
                await actions.click(XPATHS.description.closeButton);
            } catch { }

            await actions.hardInput(XPATHS.description.textBox, description);

            await actions.input(XPATHS.description.textBox, 'ENTER');
            

            await actions.click(XPATHS.description.publishButton);
            

            logger.info('Channel description updated.');
        }

        if (logoPath) {
            logger.info('Updating channel logo...');
            await session.driver.get(`${studioUrl}/editing/images`);
            

            try {
                await actions.click(XPATHS.logo.dismissButton);
            } catch { }

            try {
                await actions.click(XPATHS.logo.closeButton);
            } catch { }

            await actions.input(XPATHS.logo.fileInput, path.resolve(logoPath));
            

            await actions.click(XPATHS.logo.doneButton);
            

            await actions.click(XPATHS.logo.publishButton);
            ;

            logger.info('Channel logo updated.');
        }

        logger.info('All requested updates completed.');
        return channelId;
    } catch (error) {
        logger.error(`Failed to create and update channel: ${error.message}`);
        throw error;
    }
}
