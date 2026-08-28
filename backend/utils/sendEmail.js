import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  try {
    let transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Create a mock jsonTransport or attempt ethereal test account safely
      try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
      } catch (etherealErr) {
        // Fallback to JSON logger transport if network/Ethereal is unreachable
        transporter = nodemailer.createTransport({
          jsonTransport: true
        });
      }
    }

    const message = {
      from: `${process.env.FROM_NAME || 'EduSphere LMS'} <${process.env.FROM_EMAIL || 'noreply@edusphere.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f5; border-radius: 8px;">
        <h2 style="color: #6366f1;">EduSphere LMS Notification</h2>
        <p>${options.message}</p>
      </div>`
    };

    const info = await transporter.sendMail(message);
    console.log(`[Nodemailer] Email processed: %s`, info.messageId || 'Success');
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`[Nodemailer] Preview Email URL: %s`, nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.warn('[Nodemailer Warning]: Email could not be delivered, but registration succeeded. Details:', error.message);
    return null;
  }
};
