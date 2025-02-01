import "dotenv/config";
import nodemailer from "nodemailer";
import { ErrorHandler } from "../exceptions/errorHandler.js";
import { htmlToText } from "html-to-text";

async function mailConfig (){
  return new Promise((resolve, reject) => { 
    try {
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
          console.log("SMTP Connection Error: ",error);
          reject(new ErrorHandler(500, "Internal Server Error",[error]));
        } else {
          console.log("SMTP Connected Successfully!");
          resolve(transport);
        }
      });
      
      return transport;
    } catch (error) {
      reject(error);
    }
  });
}

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
    const transport = await mailConfig();
    await transport.sendMail({
      from: `${senderName} <${senderEmail}>`,
      to,
      subject,
      text: textContent,
      html: htmlContent, // html body
    });
  } catch (error) {
    console.log("MAILER ERROR: ", "Failed to send email, ",error);
    throw error;
  }
};

export default SendMail;