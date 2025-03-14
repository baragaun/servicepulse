import mailer from '../helpers/mailer.ts'

mailer.init();
await mailer.send();

