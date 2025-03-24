import Chance from 'chance';

const chance = new Chance();

const date = new Date();
const dateMMDD = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

let emailCounter = 1;
let userHandleCounter = 1;

export const uniqueEmail = (prefix: string, domain: string): string => {
  return `${prefix || 'test'}${dateMMDD}-${crypto.randomUUID().replaceAll('-', '')}-${emailCounter++}@${domain || 'test.com'}`;
};

export const uniqueUserHandle = (): string => {
  return `${chance.word()}-${crypto.randomUUID().replaceAll('-', '')}-${userHandleCounter++}`;
};

export default chance;
