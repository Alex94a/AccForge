// utils/config.js
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Reads the configuration from the YAML file and sets the service key.
 */
export function loadConfig() {
    // Path to the YAML configuration file
    const configPath = path.resolve('config.yml');

    // Check if the config file exists
    if (!fs.existsSync(configPath)) {
        throw new Error('Configuration file config.yml not found.');
    }

    // Read and parse the YAML file
    const configFile = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(configFile);

    // You can return the entire config if you need other config values elsewhere
    return config;
}
