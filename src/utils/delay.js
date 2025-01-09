export const randomDelay = async (seconds = 1) => {
    const randomFactor = 0.1 * (Math.random() * 2 - 1); // Generate a random factor between -0.1 and +0.1
    const delay = seconds * 1000 * (1 + randomFactor); // Apply random factor to the delay
    return new Promise(resolve => setTimeout(resolve, delay)); // Delay execution for the calculated time
};
