import { Logger } from '../utils/logger.js';
import { createSmsService } from '../services/sms.js';
import { smsService } from '../../config.js';
import { Key } from 'selenium-webdriver';
import { TimeoutError } from 'selenium-webdriver';



const XPATHS_REGISTER = {
  createAccountButton: '//*[@id="yDmH0d"]/c-wiz/div/div[3]/div/div[2]/div/div/div[1]/div/button',
  createPersonalAccount: '//*[@id="yDmH0d"]/c-wiz/div/div[3]/div/div[2]/div/div/div[2]/div/ul/li[1]',
  firstNameInput: '//*[@id="firstName"]',
  lastNameInput: '//*[@id="lastName"]',
  dayInput: '//*[@id="day"]',
  monthSelect: '//*[@id="month"]',
  yearInput: '//*[@id="year"]',
  genderSelect: '//*[@id="gender"]',
  phoneNumberInput: '//*[@id="phoneNumber"]',
  phoneNextButton: '//*[@id="phone-next-button"]',
  smsCodeInput: '//*[@id="sms-code"]',
  smsNextButton: '//*[@id="sms-next-button"]',
  recoveryEmailInputElement: '//*[@id="recoveryEmail"]',
  recoveryNextButton: '//*[@id="recovery-next-button"]',
  useCurrentEmailButton: '//*[@id="yDmH0d"]/c-wiz/div/div[2]/div/div/div/form/span/section/div/div/div[1]/div[1]/div/span/div[3]/div/div[1]/div',
  loginInput: '//*[@id="yDmH0d"]/c-wiz/div/div[2]/div/div/div/form/span/section/div/div/div/div[1]/div/div[1]/div/div[1]/input',
  passwordInput: '//*[@id="passwd"]/div[1]/div/div[1]/input',
  confirmPasswordInput: '//*[@id="confirm-passwd"]/div[1]/div/div[1]/input'
};

const logger = new Logger('Register');


export async function register(session, actions, accountData) {
  try {
    logger.info('Starting account registration');
    await actions.navigate('https://accounts.google.com/');

    logger.info('Clicking "Create account" button');
    await actions.click(XPATHS_REGISTER.createAccountButton);
    await actions.click(XPATHS_REGISTER.createPersonalAccount);

    logger.info('Entering personal information');
    await actions.input(XPATHS_REGISTER.firstNameInput, accountData.firstName);
    await actions.input(XPATHS_REGISTER.lastNameInput, accountData.lastName);
    await actions.input(XPATHS_REGISTER.lastNameInput, Key.ENTER);

    logger.info('Entering date of birth and gender');
    await actions.input(XPATHS_REGISTER.dayInput, accountData.birthday.day);
    await actions.selectOption(XPATHS_REGISTER.monthSelect, accountData.birthday.month);
    await actions.input(XPATHS_REGISTER.yearInput, accountData.birthday.year);
    await actions.selectOption(XPATHS_REGISTER.genderSelect, accountData.gender);
    await actions.input(XPATHS_REGISTER.yearInput, Key.ENTER);


    
    try {
      logger.info('Checking for current email option...');
      await actions.emulateClick(XPATHS_REGISTER.useCurrentEmailButton);
    } catch (error) {
      logger.warn('Button "Use my current email address instead" not found.');
    }

    logger.info('Entering login...');
    await actions.input(XPATHS_REGISTER.loginInput, accountData.login.replace("@gmail.com", ""));
    await actions.input(XPATHS_REGISTER.loginInput, Key.ENTER);

    logger.info('Entering password...');
    await actions.input(XPATHS_REGISTER.passwordInput, accountData.password);
    await actions.input(XPATHS_REGISTER.confirmPasswordInput, accountData.password);
    await actions.input(XPATHS_REGISTER.confirmPasswordInput, Key.ENTER);


    logger.info('Proceeding with phone number verification');
    let phone = await handlePhoneVerification(session, actions, accountData);

    logger.info('Entering recovery email');
    await actions.input(XPATHS_REGISTER.recoveryEmailInputElement, accountData.recovery);
    await actions.click(XPATHS_REGISTER.recoveryNextButton);

    logger.info('Account registration completed');
    return phone;
  } catch (error) {
    logger.error(`Registration failed: ${error.message}`);
    throw error;
  }
}

async function handlePhoneVerification(session, actions, accountData) {
  const smsServiceInstance = createSmsService(smsService);
  let codeReceived = false;
  let phone = null;

  for (let PhoneAttempt = 1; PhoneAttempt <= 11; PhoneAttempt++) {
    try {
      await actions.getElement(XPATHS_REGISTER.phoneNumberInput, 'xpath', 4000);

      if (PhoneAttempt > 1) {
        await smsServiceInstance.denyNumber(phone.id);
      }

      if (PhoneAttempt === 11) {
        logger.error('Maximum phone number attempts reached.');
        break;
      } else {
        phone = await smsServiceInstance.getNumber();
        logger.info(`Attempting to input a new number ${phone.number} (attempt ${PhoneAttempt})...`);
      }

      await actions.input(XPATHS_REGISTER.phoneNumberInput, `${phone.number}`);
      await actions.input(XPATHS_REGISTER.phoneNumberInput, Key.ENTER);
    } catch (error) {
      if (error instanceof TimeoutError) {
        logger.info(`SMS code sent to number ${phone.number}.`);
        codeReceived = true;
        break;
      } else {
        throw error;
      }
    }
  }

  if (!codeReceived) {
    throw new Error('No SMS code received');
  }

  logger.info('Waiting for SMS code...');
  let code = await smsServiceInstance.getCode(phone.id);

  if (code == null) {
    throw new Error('No SMS code received');
  }

  logger.info('Entering SMS code...');
  await actions.input(XPATHS_REGISTER.phoneNumberInput, code);
  await actions.click(XPATHS_REGISTER.phoneNextButton);
}
