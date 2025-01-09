import { faker } from '@faker-js/faker';
import sharp from 'sharp';
import fs from 'fs'; 



export function generateAccountData() {
    const gender = Math.random() < 0.5 ? '1' : '2';
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const login = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000}@gmail.com`;
    const password = Math.random().toString(36).slice(-8);
    const recoveryEmail = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000}@rambler.ru`;

    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 20;
    const birthYear = `${Math.floor(Math.random() * (minYear - 1990 + 1)) + 1990}`;
    const birthMonth = `${Math.floor(Math.random() * 12) + 1}`;
    const birthDay = `${Math.floor(Math.random() * 31) + 1}`;

    const birthday = {
        day: birthDay,
        month: birthMonth,
        year: birthYear,
    };
    
    return {
        firstName,
        lastName,
        login,
        password,
        recoveryEmail,
        birthday,
        gender,
    };
}


export function generateBio() {
    const words = [
        'лучший', 'хороший', 'прекрасный', 'невероятный', 'замечательный', 'классный', 'крутой', 'интересный', 'фантастический',
        'необычный', 'творческий', 'уникальный', 'удивительный', 'захватывающий', 'очаровательный', 'вдохновляющий', 'потрясающий',
        'великолепный', 'завораживающий', 'неповторимый',
    ];

    return words.sort(() => Math.random() - 0.5).slice(0, 20).join(' ');
}


export async function generateLogo(channelName) {
    const backgroundColor = faker.internet.color();
    const logoPath = `./logos/${channelName}.png`;

    await sharp({
        create: {
            width: 300,
            height: 300,
            channels: 3,
            background: backgroundColor,
        },
    })
        .text(channelName, 150, 150, { align: 'center', color: 'white', fontSize: 20 })
        .toFile(logoPath);

    return logoPath;
}


export async function createChannelBio(channelName) {
    const bio = generateBio();
    const logo = await generateLogo(channelName);
    return { bio, logo };
}


export async function saveAccount(accountData, status) {
    const accountString = `${accountData.login}:${accountData.password}:${accountData.recoveryEmail}:${status}\n`;

    fs.appendFileSync('accounts.txt', accountString);
    logger.info(`Account ${status} saved: ${accountData.login}`);
}
