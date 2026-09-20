const activateEmailTemplate = (email: string, url: string, txt: string) => `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f3f3f3;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f3f3;padding:24px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
            <tr>
              <td style="background:#131921;padding:18px 24px;border-radius:6px 6px 0 0;">
                <span style="color:#ffffff;font-size:24px;font-weight:bold;letter-spacing:-1px;">amazon</span>
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;padding:32px 24px;">
                <h1 style="margin:0 0 16px;font-size:22px;color:#111111;">Verify your email address</h1>
                <p style="margin:0 0 12px;font-size:14px;color:#333333;line-height:1.5;">
                  Hi ${email}, thanks for creating an account. Confirm your email address to finish setting it up.
                </p>
                <p style="margin:0 0 24px;font-size:14px;color:#333333;line-height:1.5;">${txt}</p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="background:#febd69;border-radius:24px;">
                      <a href="${url}" style="display:inline-block;padding:12px 32px;font-size:15px;font-weight:bold;color:#111111;text-decoration:none;">
                        ${txt}
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0;font-size:12px;color:#767676;line-height:1.5;">
                  If the button does not work, paste this link into your browser:<br />
                  <span style="color:#007185;word-break:break-all;">${url}</span>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;">
                <p style="margin:0;font-size:11px;color:#767676;line-height:1.5;">
                  This message was sent to ${email}. If you did not create an account you can ignore it.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export default activateEmailTemplate;
