import { Logger } from '../utils/logger.js';
import { createSmsService } from '../services/sms.js';
import { smsService } from '../../config.js';
import { Key } from 'selenium-webdriver';


const XPATHS_REGISTER = {
  createAccountButton: '//*[@id="yDmH0d"]/c-wiz/div/div[3]/div/div[2]/div/div/div[1]/div/button',
  createPersonalAccount: '//*[@id="yDmH0d"]/c-wiz/div/div[3]/div/div[2]/div/div/div[2]/div/ul/li[1]',
  firstNameInput: '//*[@id="firstName"]',
  lastNameInput: '//*[@id="lastName"]',
  dayInput: '//*[@id="day"]',
  monthSelect: '//*[@id="month"]',
  yearInput: '//*[@id="year"]',
  genderSelect: '//*[@id="gender"]',
  useCurrentEmailButton: '//*[@id="yDmH0d"]/c-wiz/div/div[2]/div/div/div/form/span/section/div/div/div[1]/div[1]/div/span/div[3]/div/div[1]/div',
  loginInput: '//*[@id="yDmH0d"]/c-wiz/div/div[2]/div/div/div/form/span/section/div/div/div/div[1]/div/div[1]/div/div[1]/input',
  passwordInput: '//*[@id="passwd"]/div[1]/div/div[1]/input',
  confirmPasswordInput: '//*[@id="confirm-passwd"]/div[1]/div/div[1]/input',
  phoneNumberInput: '//*[@id="phoneNumberId"]',
  phoneNextButton: '//*[@id="next"]/div/button',
  smsCodeInput: '//*[@id="code"]',
  recoveryEmailInputElement: '//*[@id="recoveryEmailId"]',
  recoveryNextButton: '//*[@id="recoveryNext"]/div/button',
    agreeButton: '//*[@id="next"]/div/button',
  finishButton: '//*[@id="yDmH0d"]/c-wiz/div/div[3]/div/div[1]/div/div/button'
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

    await new Promise(resolve => setTimeout(resolve, 3000)); 

    try {
      try {
        logger.info('Checking for current email option...');
        await actions.emulateClick(XPATHS_REGISTER.useCurrentEmailButton);
      } catch (error) {
        logger.warn('Button "Use my current email address instead" not found.');
      }

      logger.info('Entering login...');
      await actions.input(XPATHS_REGISTER.loginInput, accountData.login.replace("@gmail.com", ""));
      await actions.input(XPATHS_REGISTER.loginInput, Key.ENTER);
    } catch {
      await session.driver.navigate().refresh();
      await new Promise(resolve => setTimeout(resolve, 5000)); 
      try {
        logger.info('Checking for current email option...');
        await actions.emulateClick(XPATHS_REGISTER.useCurrentEmailButton);
      } catch (error) {
        logger.warn('Button "Use my current email address instead" not found.');
      }

      logger.info('Entering login...');
      await actions.input(XPATHS_REGISTER.loginInput, accountData.login.replace("@gmail.com", ""));
      await actions.input(XPATHS_REGISTER.loginInput, Key.ENTER);
    }

    logger.info('Entering password...');
    await actions.input(XPATHS_REGISTER.passwordInput, accountData.password);
    await actions.input(XPATHS_REGISTER.confirmPasswordInput, accountData.password);
    await actions.input(XPATHS_REGISTER.confirmPasswordInput, Key.ENTER);


    logger.info('Proceeding with phone number verification');
    let phone = await handlePhoneVerification(session, actions, accountData);

    logger.info('Entering recovery email');
    await actions.input(XPATHS_REGISTER.recoveryEmailInputElement, accountData.recovery);
    await actions.click(XPATHS_REGISTER.recoveryNextButton);

    this.logger.info('Clicking "I agree" button...');
		await this.clickElement('//*[@id="next"]/div/button');
	
		this.logger.info('Clicking "Create account" button...');
		await this.clickElement(XPATHS_REGISTER.finishButton);

		this.logger.info('Google account created successfully.');

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

      await actions.input(XPATHS_REGISTER.phoneNumberInput, `${phone.number}`, true);
      await actions.input(XPATHS_REGISTER.phoneNumberInput, Key.ENTER);
    } catch (error) {
      logger.info(`SMS code sent to number ${phone.number}.`);
      codeReceived = true;
      break;
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
