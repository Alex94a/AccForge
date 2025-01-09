import { By } from 'selenium-webdriver';

/**
 * Returns the correct Selenium locator function based on selector type.
 * 
 * @param {string} selector - The CSS selector string.
 * @param {string} selectorType - The type of selector (css, id, xpath).
 * @returns {Function} - The Selenium By selector function.
 * @throws {Error} - Throws an error if the selector type is unsupported.
 */
export const getSelector = (selector, selectorType = 'xpath') => {
    const selectorMap = {
        css: By.css,
        id: By.id,
        xpath: By.xpath
    };

    const selectorFunction = selectorMap[selectorType.toLowerCase()];
    
    if (!selectorFunction) {
        throw new Error(`Unsupported selector type: ${selectorType}. Supported types: css, id, xpath.`);
    }

    return selectorFunction(selector);
};
