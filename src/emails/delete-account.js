export const deleteAccountEmail = ({ name = "there", token = "" }) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirm Account Deletion</title>
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
                    <p style="color:#f0f0f0;font-size:22px;font-weight:700;letter-spacing:-0.5px;margin:8px 0 0;">Clickfold</p>
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
                    <p style="color:#ffffff;font-size:24px;font-weight:700;text-align:center;margin:0 0 16px;">Confirm Account Deletion</p>
                  </td>
                </tr>
              </table>

              <!-- Body text -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="color:#a0a0a0;font-size:15px;line-height:1.6;margin:0 0 12px;">Hi ${name},</p>
                    <p style="color:#a0a0a0;font-size:15px;line-height:1.6;margin:0 0 12px;">
                      We received a request to delete your <strong>Clickfold</strong> account.
                      This action is permanent &mdash; all your links and data will be removed.
                    </p>
                    <p style="color:#a0a0a0;font-size:15px;line-height:1.6;margin:0 0 12px;">
                      If you want to proceed, click the button below. This link expires in
                      <strong>15 minutes</strong>.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:28px 0;">
                    <a href="https://clickfold.vercel.app/delete-account/${token}"
                       style="background-color:#ff2d2d;color:#ffffff;font-size:15px;font-weight:600;padding:12px 32px;border-radius:8px;text-decoration:none;display:inline-block;">
                      Delete My Account
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Muted text -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <p style="color:#666;font-size:13px;line-height:1.5;text-align:center;margin:0 0 8px;">
                      If you didn't request this, you can safely ignore this email. Your account will remain active.
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
                      &copy; 2026 Clickfold &middot; You received this because a deletion was requested for your account.
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
