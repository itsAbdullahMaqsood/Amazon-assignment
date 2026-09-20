import nodemailer from "nodemailer";

// Returns false instead of throwing: a signup must not 500 because SMTP is down
// or not configured yet.
export const sendEmail = async (
    to: string,
    url: string,
    txt: string,
    subject: string,
    template: (email: string, url: string, txt: string) => string
) => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        console.warn(`[email] SMTP is not configured; "${subject}" was not sent to ${to}.`);
        console.warn(`[email] link for local development: ${url}`);
        return false;
    }

    try {
        const transport = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            secure: Number(SMTP_PORT) === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        await transport.sendMail({
            from: MAIL_FROM,
            to,
            subject,
            html: template(to, url, txt),
        });

        return true;
    } catch (error: any) {
        console.error(`[email] failed to send "${subject}" to ${to}: ${error.message}`);
        console.warn(`[email] link for local development: ${url}`);
        return false;
    }
};
