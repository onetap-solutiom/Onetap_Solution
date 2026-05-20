import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging
from itsdangerous import URLSafeTimedSerializer
from flask import current_app

logger = logging.getLogger('security')

def generate_verification_token(email):
    """Generate a secure, timed serializer token using Flask secret key."""
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return serializer.dumps(email, salt='email-verify-salt')

def confirm_verification_token(token, expiration=86400): # Token valid for 24 hours
    """Confirm and deserialize verification token."""
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = serializer.loads(
            token,
            salt='email-verify-salt',
            max_age=expiration
        )
        return email
    except Exception:
        return False

def send_verification_email(to_email, user_name, verification_link):
    """Send a beautifully formatted verification email via SMTP."""
    smtp_server = os.environ.get('SMTP_SERVER')
    smtp_port = os.environ.get('SMTP_PORT', 587)
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    smtp_sender = os.environ.get('SMTP_SENDER', f"OneTap Solution <{smtp_user}>" if smtp_user else "OneTap Solution <noreply@onetapsolution.com>")

    if not smtp_server or not smtp_user or not smtp_password:
        logger.warning(f"SMTP settings not fully configured in environment. Verification Link for {to_email}: {verification_link}")
        return False

    # HTML Email template matching our dark-mode glassmorphic style
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - OneTap Solution</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #050505; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #0B0E14; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; padding: 40px 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding-bottom: 25px;">
              <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                OneTap<span style="color: #04C244;">Solution</span> 🚀
              </span>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="height: 1px; background-color: rgba(255, 255, 255, 0.08); line-height: 1px; font-size: 1px;">&nbsp;</td>
          </tr>
          
          <!-- Title -->
          <tr>
            <td align="center" style="padding: 30px 0 15px 0;">
              <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Verify your email address</h2>
            </td>
          </tr>
          
          <!-- Message Body -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #94A3B8;">
                Hi {user_name},<br><br>
                Thank you for joining OneTap Solution! Please click the button below to verify your email address and activate your account.
              </p>
            </td>
          </tr>
          
          <!-- Action Button -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <a href="{verification_link}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #04C244; color: #000000; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 14px; box-shadow: 0 4px 15px rgba(4, 194, 68, 0.3); font-family: sans-serif;">
                Verify Email Address
              </a>
            </td>
          </tr>
          
          <!-- Fallback Link -->
          <tr>
            <td align="center" style="padding-bottom: 25px;">
              <p style="margin: 0; font-size: 12px; color: #64748B;">
                If the button above does not work, copy and paste the link below into your web browser:
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; word-break: break-all;">
                <a href="{verification_link}" style="color: #04C244; text-decoration: underline;">{verification_link}</a>
              </p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="height: 1px; background-color: rgba(255, 255, 255, 0.08); line-height: 1px; font-size: 1px;">&nbsp;</td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 25px;">
              <p style="margin: 0; font-size: 11px; color: #475569; line-height: 1.5;">
                This is an automated security email from OneTap Solution.<br>
                Please do not reply directly to this message.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Verify your email - OneTap Solution"
        msg['From'] = smtp_sender
        msg['To'] = to_email

        # Text Fallback
        text_content = f"Hi {user_name},\n\nPlease verify your email by opening the following link: {verification_link}"
        msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))

        # Setup Connection
        port = int(smtp_port)
        if port == 465:
            server = smtplib.SMTP_SSL(smtp_server, port)
        else:
            server = smtplib.SMTP(smtp_server, port)
            server.ehlo()
            server.starttls()
            server.ehlo()
        
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_sender, to_email, msg.as_string())
        server.quit()
        logger.info(f"Verification email successfully sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False
