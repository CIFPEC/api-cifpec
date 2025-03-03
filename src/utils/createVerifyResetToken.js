import { getCodeWithToken } from "./helper.js";
import { Database,VerifyModel } from "./../models/index.js";
import SendMail from "./../utils/sendEmail.js";
import { compile } from "./compile.js";
export async function createVerifyResetToken(user, currentType,transaction,tokenConfig = {}) {
  // create verifyToken and random number
  const result = getCodeWithToken({ userId: user.id, userEmail: user.userEmail }, currentType, tokenConfig);
  try {
    // create verify
    await VerifyModel.create({
      userId: result.userId,
      verifyCode: result.code,
      verifyToken: result.token[`${result.currentType.value}Token`],
      verifyEmail: result.userEmail,
      verifyType: result.currentType.value,
      expiredAt: result.expiredTime
    }, {
      transaction
    });
  
    // get template
    const htmlOutput = await compile({
      email: result.userEmail,
      code: result.code,
      minutes: result.minutes
    }, result.currentType.emailCode);
  
    // send email
    await SendMail(
      { senderName: process.env.SENDER_NAME, senderEmail: process.env.SENDER_EMAIL },
      { to: result.userEmail, subject: result.currentType.subject, body: htmlOutput });
    
    return result.token;
  } catch (error) {
    throw error;
  }
}