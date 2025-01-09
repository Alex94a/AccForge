import { Logger } from '../utils/logger.js';

const XPATHS_COMMENT = {
    commentBox: '//*[@id="contenteditable-root"]',
    submitButton: '//*[@id="submit-button"]/yt-button-shape/button/yt-touch-feedback-shape/div/div[2]',
    placeholderArea: '//*[@id="placeholder-area"]'
};

const logger = new Logger('Comment');

export async function writeComment(session, actions, videoUrl, comment) {
    try {
        logger.info(`Opening video page: ${videoUrl}`);
        await actions.navigate(videoUrl, 15000);
        await actions.randomDelay(5);

        await actions.driver.executeScript("window.scrollTo(0, 500);");
        await actions.randomDelay(2);

        await actions.clickElement(XPATHS_COMMENT.placeholderArea);
        await actions.randomDelay(1);

        const commentInput = await actions.getElement(XPATHS_COMMENT.commentBox);
        await actions.driver.executeScript(`arguments[0].innerText = "${comment}";`, commentInput);
        await actions.randomDelay(1);

        await commentInput.sendKeys(" ");
        await actions.randomDelay(1);

        await actions.clickElement(XPATHS_COMMENT.submitButton);
        await actions.randomDelay(2);

        logger.info('Comment submitted successfully.');
    } catch (error) {
        logger.error(`Failed to submit comment: ${error.message}`);
    }
}
