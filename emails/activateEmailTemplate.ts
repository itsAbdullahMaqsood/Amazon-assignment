import { emailLayout } from "./layout";

const activateEmailTemplate = (email: string, url: string, txt: string) =>
    emailLayout({
        email,
        url,
        button: txt,
        heading: "Confirm your email",
        body: "Welcome to Markaz. Confirm this address to finish setting up your account, then you can check out, track orders and save items.",
        footnote: "If you didn't create a Markaz account, you can ignore this email.",
    });

export default activateEmailTemplate;
