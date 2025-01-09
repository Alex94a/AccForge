import { until } from 'selenium-webdriver';
import { getSelector } from '../utils/selectors.js';
import { writeFile } from 'node:fs/promises';
import { randomDelay } from '../utils/delay.js';

/**
 * Constants for delay times
 */
const SHORT_DELAY = 0.3; // Short delay to simulate human behavior
const LONG_DELAY = 1.5; // Long delay for waiting dynamic page loading

/**
 * Class for performing actions in a browser session
 */
export class SessionActions {
    /**
     * Creates an instance of the SessionActions class.
     * 
     * @param {Object} session - The session object containing the driver and logger.
     */
    constructor(session) {
        this.session = session;
        this.logger = session.logger;
    }

    /**
     * Takes a screenshot of the current page and saves it to a file.
     * 
     * @param {string} file - The path to the file where the screenshot will be saved.
     */
    async screenshot(file) {
        this.logger.info(`Taking screenshot and saving to ${file}...`);
        const image = await this.session.driver.takeScreenshot();
        await writeFile(file, image, 'base64');
        this.logger.info('Screenshot taken successfully.');
    }

    /**
     * Opens the page at the specified URL.
     * 
     * @param {string} url - The URL of the page to open.
     * @param {number} [timeout=8000] - The timeout for waiting for the page to load in milliseconds.
     */
    async navigate(url, timeout = 8000) {
        this.logger.info(`Opening page ${url}...`);
        try {
            await Promise.race([
                this.session.driver.get(url),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Page load timed out.')), timeout)
                )
            ]);
            this.logger.info('Page opened successfully.');
            await randomDelay(SHORT_DELAY);
        } catch (error) {
            this.logger.warn('Page load timed out, stopping page load.');
            await this.session.driver.executeScript("window.stop();");
            await randomDelay(SHORT_DELAY);
        }
    }

    /**
     * Gets a single element by the specified selector.
     * 
     * @param {string} selector - The selector string for the element.
     * @param {string} [selectorType='xpath'] - The type of the selector (e.g., 'xpath', 'css').
     * @param {number} [timeout=10000] - The timeout for waiting for the element in milliseconds.
     * @returns {Promise} - A promise that resolves to the located element.
     */
    async getElement(selector, selectorType = 'xpath', timeout = 10000) {
        this.logger.info(`Getting element ${selector} (${selectorType})...`);
        const locator = getSelector(selector, selectorType);
        const element = await this.session.driver.wait(
            until.elementLocated(locator), 
            timeout
        );
        this.logger.info(`Element ${selector} found successfully.`);
        await randomDelay(SHORT_DELAY);
        return element;
    }

    /**
     * Gets multiple elements by the specified selector.
     * 
     * @param {string} selector - The selector string for the elements.
     * @param {string} [selectorType='xpath'] - The type of the selector (e.g., 'xpath', 'css').
     * @param {number} [timeout=10000] - The timeout for waiting for the elements in milliseconds.
     * @returns {Promise} - A promise that resolves to an array of located elements.
     */
    async getElements(selector, selectorType = 'xpath', timeout = 10000) {
        this.logger.info(`Getting elements ${selector} (${selectorType})...`);
        const locator = getSelector(selector, selectorType);
        const elements = await this.session.driver.wait(
            until.elementsLocated(locator), 
            timeout
        );
        this.logger.info(`Elements ${selector} found successfully.`);
        await randomDelay(SHORT_DELAY);
        return elements;
    }

    /**
     * Clicks an element specified by the selector.
     * Retries up to 5 times if the click fails.
     * 
     * @param {string} selector - The selector string for the element.
     * @param {string} [selectorType='xpath'] - The type of the selector (e.g., 'xpath', 'css').
     * @throws {Error} - Throws an error if the click fails after 5 attempts.
     */
    async click(selector, selectorType = 'xpath') {
        this.logger.info(`Clicking element ${selector} (${selectorType})...`);
        let attempts = 0;
        const element = await this.getElement(selector, selectorType);
        
        while (attempts < 5) {
            try {
                await randomDelay(SHORT_DELAY);
                await element.click();
                this.logger.info(`Element ${selector} clicked successfully.`);
                await randomDelay(SHORT_DELAY);
                return;
            } catch (e) {
                this.logger.warn(`Failed to click element ${selector} (${attempts + 1}/5): ${e.message}`);
                attempts++;
                await randomDelay(SHORT_DELAY * 2); // Retry delay
            }
        }
        throw new Error(`Failed to click element ${selector}.`);
    }

    /**
     * Simulates a hard click on an element (fires mouse events directly).
     * 
     * @param {string} selector - The selector string for the element.
     * @param {string} [selectorType='xpath'] - The type of the selector (e.g., 'xpath', 'css').
     */
    async emulateClick(selector, selectorType = 'xpath') {
        this.logger.info(`Hard clicking element ${selector} (${selectorType})...`);
        const element = await this.getElement(selector, selectorType);
        await this.session.driver.executeScript(`
            var event = new MouseEvent('mouseover', { bubbles: true });
            arguments[0].dispatchEvent(event);
            event = new MouseEvent('mousedown', { bubbles: true });
            arguments[0].dispatchEvent(event);
            event = new MouseEvent('mouseup', { bubbles: true });
            arguments[0].dispatchEvent(event);
            event = new MouseEvent('click', { bubbles: true });
            arguments[0].dispatchEvent(event);
            event = new MouseEvent('mouseout', { bubbles: true });
            arguments[0].dispatchEvent(event);
        `, element);
        this.logger.info(`Element ${selector} clicked successfully (hard click).`);
    }

    /**
     * Inputs keys into an input field specified by the selector.
     * Optionally clears the field before inputting the keys.
     * Retries up to 10 times if input fails.
     * 
     * @param {string} selector - The selector string for the element.
     * @param {string} keys - The keys to be input into the field.
     * @param {boolean} [clear=false] - Whether to clear the field before inputting the keys.
     * @param {string} [selectorType='xpath'] - The type of the selector (e.g., 'xpath', 'css').
     * @throws {Error} - Throws an error if the input fails after 10 attempts.
     */
    async input(selector, keys, clear = false, selectorType = 'xpath') {
        this.logger.info(`Inputting keys '${keys}' into element ${selector} (${selectorType})...`);
        let attempts = 0;
        const element = await this.getElement(selector, selectorType);
        
        while (attempts < 10) {
            try {
                if (clear) {
                    await element.clear();
                    await randomDelay(SHORT_DELAY);
                }

                for (const char of keys) {
                    await element.sendKeys(char);
                    await randomDelay(0.05 + Math.random() * 0.15); 
                }
                this.logger.info(`Keys inputted in ${selector} successfully.`);
                await randomDelay(SHORT_DELAY);
                return;
            } catch (e) {
                this.logger.warn(`Failed to input keys in ${selector} (${attempts + 1}/10): ${e.message}`);
                attempts++;
                await randomDelay(LONG_DELAY);
            }
        }
        throw new Error(`Failed to input keys '${keys}' into element ${selector}.`);
    }

    /**
     * Hard inputs keys into an input field by directly changing the inner text.
     * 
     * @param {string} selector - The selector string for the element.
     * @param {string} keys - The keys to be input into the field.
     * @param {string} [selectorType='xpath'] - The type of the selector (e.g., 'xpath', 'css').
     */
    async emulateInput(selector, keys, selectorType = 'xpath') {
        this.logger.info(`Hard inputting keys '${keys}' into element ${selector} (${selectorType})`);
        const element = await this.getElement(selector, selectorType);
        await this.session.driver.executeScript(`arguments[0].innerText = "${keys}";`, element);
        this.logger.info(`Keys '${keys}' inputted into element ${selector} successfully (hard input).`);
        await randomDelay(SHORT_DELAY);
    }

    /**
     * Selects an option from a dropdown field by its value or text.
     * Retries up to 5 times if the selection fails.
     * 
     * @param {string} selector - The selector string for the element.
     * @param {string} value - The value or text of the option to select.
     * @param {string} [selectorType='xpath'] - The type of the selector (e.g., 'xpath', 'css').
     * @throws {Error} - Throws an error if the option selection fails after 5 attempts.
     */
    async selectOption(selector, value, selectorType = 'xpath') {
        this.logger.info(`Selecting option ${value} in element ${selector}`);
        let attempts = 0;
        const select = await this.getElement(selector, selectorType);
        
        while (attempts < 5) {
            try {
                await this.session.driver.executeScript(`
                    const select = arguments[0];
                    const value = arguments[1];
                    
                    select.value = value;

                    select.dispatchEvent(new Event('change', { bubbles: true }));

                    if (!select.value || select.value !== value) {
                        const option = Array.from(select.options).find(opt => 
                            opt.value === value || opt.text === value
                        );
                        if (option) {
                            option.selected = true;
                            select.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    }
                `, select, value);

                this.logger.info('Option selected successfully.');
                await randomDelay(SHORT_DELAY);
                return;
            } catch (error) {
                this.logger.warn(`Failed to select option (${attempts + 1}/5): ${error.message}`);
                attempts++;
                await randomDelay(LONG_DELAY);
            }
        }
        throw new Error(`Failed to select option in element ${selector}`);
    }
}
