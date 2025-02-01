/**
 * email
 * code
 * appName
 * currentYear
 */
const welcome =`
  <!DOCTYPE html>
  <html lang="en">

    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome Email</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f9f9f9;
          margin: 0;
          padding: 20px;
        }

        .container {
          max-width: 600px;
          background-color: #ffffff;
          margin: 0 auto;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .header {
          background-color: #007bff;
          color: #ffffff;
          text-align: center;
          padding: 20px;
          font-size: 24px;
        }

        .content {
          padding: 20px;
          color: #333333;
          line-height: 1.6;
        }

        .code {
          font-size: 32px;
          color: #007bff;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
        }

        .footer {
          text-align: center;
          padding: 10px;
          font-size: 12px;
          color: #777777;
        }

        @media screen and (max-width: 340px) {
          body{
            padding: 10px;
          }
        }
      </style>
    </head>

    <body>
      <div class="container">
        <div class="content">
          <h2>Welcome to Our Platform!</h2>
          <p>Hi {{email}},</p>
          <p>We’re excited to have you on board! To get started, please verify your email address using the code below:</p>
          <div class="code">{{code}}</div>
          <p>This code will expire in <strong>{{minutes}}</strong>. If you did not request this, please ignore this email.</p>
          <p style="font-style: italic; font-weight: bold;">Note that unverified accounts are automatically deleted 7 days after signup</p>
          <p>If you have any questions or need help, feel free to contact us.</p>
          <p>Thank you,<br>The {{appName}} Team</p>
        </div>
        <div class="footer">
          © {{currentYear}} {{appName}}. All rights reserved.
        </div>
      </div>
    </body>

  </html>
`;

export default welcome;