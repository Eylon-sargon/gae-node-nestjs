import { Inject, Injectable } from '@nestjs/common';
import { GmailConfigurer } from './gmail.configurer';
import { createTransport, SentMessageInfo } from 'nodemailer';
import { Options } from 'nodemailer/lib/mailer';
import * as Logger from 'bunyan';
import { Configuration, Context, createLogger } from '..';

@Injectable()
export class GmailSender {
  private logger: Logger;

  constructor(
    private readonly gmailConfigurer: GmailConfigurer,
    @Inject("Configuration") private readonly configurationProvider: Configuration,
  ) {
    this.logger = createLogger('gmail-sender');
  }

  async send(context: Context, mailOptions: Options) {
    const credential = await this.gmailConfigurer.getCredential(context);
    const gmailUser = await this.gmailConfigurer.getUser(context);

    if (credential && gmailUser && this.configurationProvider.auth.google) {
      const auth = {
        type: 'oauth2',
        user: gmailUser.value,
        clientId: this.configurationProvider.auth.google.clientId,
        clientSecret: this.configurationProvider.auth.google.secret,
        refreshToken: credential.value,
      };

      const transport: any = {
        service: 'gmail',
        auth,
      };
      const transporter = createTransport(transport);

      await new Promise((resolve, reject) =>
        transporter.sendMail(
          {
            from: auth.user,
            ...mailOptions,
          },
          (err: Error | null, res: SentMessageInfo) => {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          },
        ),
      );
    } else {
      this.logger.error('Gmail OAuth is not configured yet');
    }
  }
}
