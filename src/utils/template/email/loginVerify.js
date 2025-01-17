/**
 * name
 * appName
 * datetime
 * country
 * code
 * currentYear
 */
const loginVerify = `
  <!DOCTYPE html>
  <html lang="en">

    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
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

    <body style="padding: 20px;">
      <div class="container">
        <div class="header">
          {{ appName }} Verification Code
        </div>
        <div class="content">
          <h2>Hi {{name}},</h2>
          <p>On {{ datetime }}  you attempted to login to {{ appName }} from a new device located in {{ Country }}</p>
          <p>if this was you, please use the code below to proceed:</p>
          <div class="code">{{ code }}</div>
          <p>This code will expire in <strong>{{minutes}}</strong>. If you did not request this, please ignore this email.</p>
          <p>Thank you,<br>The {{ appName }} Team</p>
        </div>
        <div class="footer">
          © {{currentYear}} {{appName}}. All rights reserved.
        </div>
      </div>
    </body>

  </html>
`;

export default loginVerify;