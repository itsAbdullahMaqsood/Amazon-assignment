import nodemailer from "nodemailer";

// Returns false instead of throwing: nothing a customer does — signing up,
// placing an order — may fail because SMTP is down or not configured yet.
export const sendHtmlEmail = async (to: string, subject: string, html: string, devHint = "") => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        console.warn(`[email] SMTP is not configured; "${subject}" was not sent to ${to}.`);
        if (devHint) console.warn(`[email] ${devHint}`);
        return false;
    }

    try {
        const transport = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            secure: Number(SMTP_PORT) === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        await transport.sendMail({ from: MAIL_FROM, to, subject, html });

        return true;
    } catch (error: any) {
        console.error(`[email] failed to send "${subject}" to ${to}: ${error.message}`);
        if (devHint) console.warn(`[email] ${devHint}`);
        return false;
    }
};

// The link-shaped emails (activation, password reset) go through here.
export const sendEmail = async (
    to: string,
    url: string,
    txt: string,
    subject: string,
    template: (email: string, url: string, txt: string) => string
) => sendHtmlEmail(to, subject, template(to, url, txt), `link for local development: ${url}`);
