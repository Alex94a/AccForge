import { promises as fs } from 'fs';
import PQueue from 'p-queue';
import { Logger } from '../utils/logger.js';

export class ProxyManager {
    constructor() {
        this.proxyFilePath = 'data/proxies.txt';
        this.queue = new PQueue({ concurrency: 1 }); 
        this.logger = new Logger('ProxyService');
    }

    async readAndRotateProxy() {
        return this.queue.add(async () => {
            try {
                await this._ensureProxyFileExists();
                this.logger.info('Rotating proxy...');

                const proxies = await this._readProxies();
                if (!proxies.length) {
                    this.logger.warn('No proxies available in the file.');
                    return null;
                }

                const rotatedProxy = proxies.shift();
                proxies.push(rotatedProxy);

                await this._writeProxies(proxies);
                this.logger.info(`Proxy rotated successfully: ${rotatedProxy}`);
                return rotatedProxy;
            } catch (error) {
                this.logger.error(`Error rotating proxy: ${error.message}`);
                throw error;
            }
        });
    }


    async _readProxies() {
        try {
            const data = await fs.readFile(this.proxyFilePath, 'utf8');
            const proxies = data
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line.length > 0);

            if (proxies.length === 0) this.logger.warn('No proxies found in the proxy file');

            return proxies;
        } catch (error) {
            this.logger.error(`Error reading proxy file: ${error.message}`);
            throw error;
        }
    }

    async _writeProxies(proxies) {
        try {
            const data = proxies.join('\n') + '\n';
            await fs.writeFile(this.proxyFilePath, data, 'utf8');
        } catch (error) {
            this.logger.error(`Error writing proxy file: ${error.message}`);
            throw error;
        }
    }

    async _ensureProxyFileExists() {
        try {
            await fs.access(this.proxyFilePath);
        } catch {
            await fs.writeFile(this.proxyFilePath, '', 'utf8');
            this.logger.info(`Proxy file created at: ${this.proxyFilePath}`);
        }
    }
}

export default ProxyManager;
