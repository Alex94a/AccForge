import { Logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

const XPATHS_UPLOAD = {
    uploadButton: '//*[@id="upload_button"]',
    fileInput: '//*[@id="file_input"]',
    fileSubmitButton: '//*[@id="file_submit_button"]',
};

const logger = new Logger('Upload');

export async function upload(session, actions, filePath) {
    try {
        const absolutePath = path.resolve(filePath);
        if (!fs.existsSync(absolutePath)) {
            throw new Error('File does not exist');
        }

        logger.info('Starting file upload process');
        await actions.navigate('https://drive.google.com/');
        await actions.randomDelay(2);

        logger.info('Clicking "Upload" button');
        await actions.click(XPATHS_UPLOAD.uploadButton);
        await actions.randomDelay(1);

        logger.info('Selecting file to upload');
        await actions.setInputFile(XPATHS_UPLOAD.fileInput, absolutePath);
        await actions.randomDelay(2);

        logger.info('Submitting file');
        await actions.click(XPATHS_UPLOAD.fileSubmitButton);
        await actions.randomDelay(5);

        logger.info('File upload completed successfully');
    } catch (error) {
        logger.error(`File upload failed: ${error.message}`);
    }
}



