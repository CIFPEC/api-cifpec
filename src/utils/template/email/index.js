import authVerify from "./authVerify.js";
import welcome from "./welcome.js";
import loginVerify from './loginVerify.js';
import requestCode from './requestCode.js';
import resetPassword from './resetPassword.js';

export {
  authVerify as emailAuthVerify,
  welcome as emailWelcome,
  loginVerify as emailLoginVerify,
  requestCode as emailRequestCode,
  resetPassword as emailResetPassword
}