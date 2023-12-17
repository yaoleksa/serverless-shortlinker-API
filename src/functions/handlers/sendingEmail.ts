import { SES } from 'aws-sdk';
import { SendEmailResponse } from 'aws-sdk/clients/ses';
import schedule from 'node-schedule';

const ses = new SES();

export default async function sender(recipient: string, term: number): Promise<SendEmailResponse> {
    if(term) {
        schedule.scheduleJob(new Date(term), () => {
            ses.sendEmail({
                Source: 'ekt_1@ukr.net',
                Destination: {
                    ToAddresses: [recipient]
                },
                Message: {
                    Body: {
                        Text: {
                            Charset: 'UTF-8',
                            Data: 'Your URL item has been deleted'
                        }
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: 'Expiration alert'
                    }
                }
            }).promise();
        });
    }
    return ses.sendEmail({
        Source: 'ekt_1@ukr.net',
        Destination: {
            ToAddresses: [recipient]
        },
        Message: {
            Body: {
                Text: {
                    Charset: 'UTF-8',
                    Data: term ? `Your URL item will be deleted at ${new Date(term)}` : 'Your URL ITEM will be deleted after first visit'
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Expiration alert'
            }
        }
    }).promise();
}