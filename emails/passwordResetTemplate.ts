import { emailLayout } from "./layout";

const passwordResetTemplate = (email: string, url: string, txt: string) =>
    emailLayout({
        email,
        url,
        button: txt,
        heading: "Reset your password",
        body: "Someone asked to reset the password on your Markaz account. The link expires in 6 hours.",
        footnote: "If you didn't ask for this, you can ignore this email and your password stays the same.",
    });

export default passwordResetTemplate;
