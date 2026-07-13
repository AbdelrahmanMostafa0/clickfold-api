export const forgotPasswordEmail = ({ name = "there", token = "" }) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:10px 0;background-color:#0a0a0a;font-family:'Inter','Segoe UI',Helvetica,Arial,sans-serif;">
  <!-- Outer wrapper table -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;">
    <tr>
      <td align="center" style="padding:40px 12px;">
        <!-- Container -->
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;width:100%;background-color:#141414;border-radius:12px;border:1px solid #222;">
          <tr>
            <td style="padding:32px 24px;">

              <!-- Logo -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <p style="color:#f0f0f0;font-size:22px;font-weight:700;letter-spacing:-0.5px;margin:8px 0 0;">LinkPulse</p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:24px 0;">
                    <hr style="border:none;border-top:1px solid #2a2a2a;margin:0;" />
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <p style="color:#ffffff;font-size:24px;font-weight:700;text-align:center;margin:0 0 16px;">Reset Your Password</p>
                  </td>
                </tr>
              </table>

              <!-- Body text -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="color:#a0a0a0;font-size:15px;line-height:1.6;margin:0 0 12px;">Hi ${name},</p>
                    <p style="color:#a0a0a0;font-size:15px;line-height:1.6;margin:0 0 12px;">
                      We received a request to reset the password for your <strong>LinkPulse</strong> account.
                      Click the button below to choose a new password.
                    </p>
                    <p style="color:#a0a0a0;font-size:15px;line-height:1.6;margin:0 0 12px;">
                      This link expires in <strong>15 minutes</strong>. If you didn't request a password reset, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:28px 0;">
                    <a href="https://linkpulse.vercel.app/reset-password/${token}"
                       style="background-color:#6366f1;color:#ffffff;font-size:15px;font-weight:600;padding:12px 32px;border-radius:8px;text-decoration:none;display:inline-block;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Muted text -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <p style="color:#666;font-size:13px;line-height:1.5;text-align:center;margin:0 0 8px;">
                      If the button doesn't work, copy and paste this link into your browser:<br />
                      <a href="https://linkpulse.vercel.app/reset-password/${token}" style="color:#6366f1;word-break:break-all;">
                        https://linkpulse.vercel.app/reset-password/${token}
                      </a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:24px 0;">
                    <hr style="border:none;border-top:1px solid #2a2a2a;margin:0;" />
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <p style="color:#555;font-size:12px;text-align:center;margin:0;">
                      &copy; 2026 LinkPulse &middot; You received this because a password reset was requested for your account.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
