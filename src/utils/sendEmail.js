import "dotenv/config";
import nodemailer from "nodemailer";
import { ErrorHandler } from "../exceptions/errorHandler.js";
import { htmlToText } from "html-to-text";

// create transport
const transport = nodemailer.createTransport({
  host:process.env.EMAIL_HOST,
  port:process.env.EMAIL_PORT,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASSWORD,
  },
});

// test connection
transport.verify((error, success) => {
  if (error) {
    throw new ErrorHandler(500,"SMTP Connection Error:", error);
  } else {
    console.log("SMTP Connected Successfully!");
  }
});

// send email
const SendMail = async ({senderName, senderEmail},{to, subject, body}) => {
  const htmlContent = body;
  const textContent = htmlToText(htmlContent, {
    wordwrap: 130, // Wrap text untuk pembacaan lebih mudah
  });

  // send email
  if(!+process.env.SEND_EMAIL){
    console.log("NOTE: ","Email not sent in debug mode");
    return;
  }

  try {
    const info = await transport.sendMail({
      from: `${senderName} <${senderEmail}>`,
      to,
      subject,
      text: textContent,
      html: htmlContent, // html body
    });
  } catch (error) {
    throw new ErrorHandler(500, "Failed to send email", error);
  }
};

export default SendMail;