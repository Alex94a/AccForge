
import axios from 'axios';
import { Logger } from '../utils/logger.js';

const logger = new Logger('SmsService');

class SmsService {
  constructor(apiKey, country, maxPrice) {
    this.country = country;
    this.maxPrice = maxPrice;
    this.apiKey = apiKey;
    this.headers = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: 'application/json',
    };
  }

  async getNumber() {
    throw new Error('Subclasses must implement getNumber method.');
  }

  async getCode(phoneId) {
    throw new Error('Subclasses must implement getCode method.');
  }

  async denyNumber(phoneId) {
    throw new Error('Subclasses must implement denyNumber method.');
  }

  async completeNumber(phoneId) {
    throw new Error('Subclasses must implement completeNumber method.');
  }
}




class FiveSimService extends SmsService {
  constructor(apiKey, country, maxPrice) {
    super(apiKey, country, maxPrice);
  }

  async getNumber() {
    try {
      const response = await axios.get(
        `https://5sim.biz/v1/user/buy/activation/${this.country}/any/google?maxPrice=${this.maxPrice}`,
        { headers: this.headers }
      );
      const { id, phone, operator } = response.data;
      logger.info(`Successfully fetched number: ${phone} (Operator: ${operator}, ID: ${id})`);
      return { id, number: phone, operator };
    } catch (error) {
      logger.error(`Error getting number: ${error.message}`);
      throw error;
    }
  }

  async getCode(phoneId) {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const maxAttempts = 6;
    const delayBetweenAttempts = 5000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const response = await axios.get(`https://5sim.biz/v1/user/check/${phoneId}`, {
                headers: this.headers,
            });
            const smsCode = response.data?.sms?.[0]?.code || null;

            if (smsCode) {
                logger.info(`Received SMS code for phone ID ${phoneId}: ${smsCode}`);
                return smsCode;
            }
        } catch (error) {
            logger.error(`Error checking SMS code for phone ID ${phoneId}: ${error.message}`);
        }

        if (attempt < maxAttempts) {
            logger.info(`Retrying to get code for phone ID ${phoneId}, attempt ${attempt + 1}`);
            await delay(delayBetweenAttempts);
        }
    }

    await this.denyNumber(phoneId);
    logger.warn(`Failed to get SMS code for phone ID ${phoneId} after ${maxAttempts} attempts`);
    return null;
}

  async denyNumber(phoneId) {
    try {
      const response = await axios.get(`https://5sim.biz/v1/user/cancel/${phoneId}`, {
        headers: this.headers,
      });
      logger.info(`Denied number with ID ${phoneId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error denying number with ID ${phoneId}: ${error.message}`);
      throw error;
    }
  }

  async finishNumber(phoneId) {
    try {
      const response = await axios.get(`https://5sim.biz/v1/user/finish/${phoneId}`, {
        headers: this.headers,
      });
      logger.info(`Finished number with ID ${phoneId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error completing number with ID ${phoneId}: ${error.message}`);
      throw error;
    }
  }
}

export function createSmsService(config) {
  const { name, apiKey, country, maxPrice } = config;

  switch (name) {
    case '5sim':
      return new FiveSimService(apiKey, country, maxPrice);
    default:
      throw new Error(`SMS service with name "${name}" is not supported.`);
  }
}


export default createSmsService;



/*



class SmsActivateAPI extends SmsServiceAPI {
  async getNumber() {
    try {
      const response = await axios.get(`https://api.sms-activate.org/stubs/handler_api.php`, {
        params: {
          api_key: this.apiKey,
          action: 'getNumberV2',
          service: 'go',
          country: 12,
          maxPrice: 20,
        },
      });

      if (response.data === 'NO_NUMBERS' || response.data === 'NO_BALANCE') {
        throw new SmsServiceError(response.data, response.data);
      }

      const { activationId, phoneNumber, activationOperator } = response.data;
      return { id: activationId, number: phoneNumber, operator: activationOperator };
    } catch (error) {
      console.error('Error getting number:', error);
      throw error;
    }
  }

  async getCode(phoneId) {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const response = await axios.get(`https://api.sms-activate.org/stubs/handler_api.php`, {
          params: {
            api_key: this.apiKey,
            action: 'getActiveActivations',
          },
        });
  
        if (response.data === 'BAD_KEY' || response.data === 'ERROR_SQL' || response.data === 'NO_ACTIVATIONS') {
          throw new SmsServiceError(response.data, response.data);
        }
  
        const { activeActivations } = response.data;
        const activation = activeActivations.find((a) => a.activationId === phoneId);
        const smsCode = activation?.smsCode?.[0] || null;
  
        if (smsCode) {
          return smsCode;
        }
      } catch (error) {
        console.error('Error getting code:', error);
      }
  
      if (attempt < 5) {
        await delay(5000); // Задержка в 5 секунд перед следующей попыткой
      }
    }
  
    return null;
  }

  async denyNumber(phoneId) {
    try {
      const response = await axios.get(`https://api.sms-activate.org/stubs/handler_api.php`, {
        params: {
          api_key: this.apiKey,
          action: 'setStatus',
          status: 8, // Отменить номер
          id: phoneId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error denying number:', error);
      throw error;
    }
  }

  async completeNumber(phoneId) {
    try {
      const response = await axios.get(`https://api.sms-activate.org/stubs/handler_api.php`, {
        params: {
          api_key: this.apiKey,
          action: 'setStatus',
          status: 6, // Завершить использование номера
          id: phoneId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error completing number:', error);
      throw error;
    }
  }
}

*/