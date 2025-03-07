import { randomBytes } from 'crypto';

export const generateRandomAlphanumericString = (length) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  const randomBytesArray = Array.from(randomBytes(length));

  const result = randomBytesArray
    .map((byte) => characters[Math.floor((byte / 256) * charactersLength)])
    .join('');

  return result;
};
