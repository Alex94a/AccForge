export function handleError(error, context = {}, logger) {
    const errorMessage = `Error occurred: ${error.message}\nStack trace: ${error.stack}\nContext: ${JSON.stringify(context)}`;
    logger.error(errorMessage);
    throw error;
}
