// Email clients ignore CSS variables and most stylesheets, so the Markaz tokens
// are repeated here as literals. Keep them in step with styles/globals.css.
const t = {
    canvas: "#f5f6f8",
    surface: "#ffffff",
    ink: "#121a27",
    fg: "#0f1419",
    fgMuted: "#525a66",
    fgSubtle: "#737b87",
    accent: "#c4b5fd",
    accentInk: "#5c3fb8",
    line: "#e3e6eb",
};

export const escapeHtml = (value: string) =>
    String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

// One layout for every transactional email: navy band with the wordmark, a
// white card with the heading, body copy, an optional block of content (the
// order summary uses it) and one button, then the fallback link.
export const emailLayout = ({ email, heading, body, content = "", url, button, footnote }: any) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light" />
  </head>
  <body style="margin:0;padding:0;background:${t.canvas};font-family:Inter,Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${t.canvas};padding:24px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
            <tr>
              <td style="background:${t.ink};padding:20px 28px;border-radius:16px 16px 0 0;">
                <span style="color:#ffffff;font-size:26px;font-weight:bold;letter-spacing:-0.5px;">markaz</span><span style="display:inline-block;width:8px;height:8px;margin-left:2px;border-radius:50%;background:${t.accent};"></span>
              </td>
            </tr>
            <tr>
              <td style="background:${t.surface};padding:32px 28px;border:1px solid ${t.line};border-top:0;border-radius:0 0 16px 16px;">
                <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:${t.fg};">${heading}</h1>
                <p style="margin:0 0 24px;font-size:15px;color:${t.fgMuted};line-height:1.6;">${body}</p>
                ${content}
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="background:${t.accent};border-radius:10px;">
                      <a href="${url}" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:bold;color:${t.fg};text-decoration:none;">${button}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0;font-size:12px;color:${t.fgSubtle};line-height:1.6;">
                  If the button does not work, paste this link into your browser:<br />
                  <span style="color:${t.accentInk};word-break:break-all;">${url}</span>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;">
                <p style="margin:0;font-size:12px;color:${t.fgSubtle};line-height:1.6;">
                  Sent to ${escapeHtml(email)}. ${footnote}
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
