import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import nodemailer from 'nodemailer';

export class CMail {
    private static instance: CMail;
    public readonly transport: Mail;

    private constructor() {
        this.transport = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: "cirkle.app@gmail.com",
                pass: "modgajanari123"
            }
        })
    }

    public static createMail(): CMail {
        if (!CMail.instance) {
            CMail.instance = new CMail()
        }
        return CMail.instance;
    }

    public sendMail(options: SMTPTransport.MailOptions): Promise<any> {
        return new Promise((resolve, reject) => {
            this.transport?.sendMail(options, function(err, info) {
                if (err) {
                    reject({
                        message: "Failed to send email",
                        err: err
                    })
                } else {
                    console.log(info)
                    resolve(info)
                }
            })
        })
    }
}

