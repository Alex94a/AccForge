# AccForge

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Development Status](https://img.shields.io/badge/Status-In%20Development-yellow.svg)]()

> ⚠️ **Note: This project is currently in active development.** Features and documentation may be incomplete or subject to change.

AccForge is an open-source automation tool designed for creating Google accounts programmatically. It uses advanced browser fingerprinting and proxy support to provide a robust solution for automated account creation while bypassing detection mechanisms.

## Features

- **Automated Account Creation**: Streamlined process for creating Google accounts
- **Browser Fingerprinting**: Customizable browser fingerprints to avoid detection
- **Proxy Support**: Integration with proxy services for IP rotation
- **Session Management**: Robust session handling and cleanup
- **Error Handling**: Comprehensive error management and logging
- **YouTube Channel Creation**: Optional automated YouTube channel setup
- **Data Persistence**: Account data storage and status tracking

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Chrome/Chromium browser
- Valid proxy list or proxy service subscription

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/accforge.git
cd accforge
```

2. Install dependencies:
```bash
npm install
```

3. Create configuration file:
```bash
cp config.example.js config.js
```

4. Configure your settings in `config.js`

## Configuration

Update `config.js` with your specific settings:

```javascript
export const task = {
    youtubeChannel: {
        isRequired: false  // Set to true to enable YouTube channel creation
    }
};

// Add your proxy and fingerprint configurations
```

## Usage

### Basic Usage

```javascript
import { runAccountCreation } from './src/executor.js';

// Create 5 accounts
const results = await runAccountCreation(5);
console.log(`Created ${results.successful.length} accounts successfully`);
```

### Advanced Usage

```javascript
import { AccountExecutor } from './src/executor.js';

const executor = new AccountExecutor();
await executor.initialize();

// Custom configuration per session
const config = {
    fingerprint: 'fetch',
    proxy: 'database',
    headless: false
};

await executor.execute(10); // Create 10 accounts
const results = executor.getResults();
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This tool is for educational purposes only. Users are responsible for complying with applicable terms of service and local laws.

## Support

If you encounter any issues or have questions, please:
1. Check the existing issues
2. Create a new issue with a detailed description
3. Provide logs and configuration (without sensitive information)