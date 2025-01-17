import express from "express";
import { validateBody } from "./../../validations/validation.js";
import { registerSchema, requestCodeSchema, resetSchema, verifySchema } from "./../../validations/auth/userValidations.js";
import { register, login, requestCodeVerifyEmail, requestCodeReset, verifyReset, verifyEmail, reset } from "./../../controllers/authController.js";
const router = express.Router();


/** 
 * ======
 *  AUTH 
 * ======
 * **/
// register
router.post("/register",validateBody(registerSchema), register);
// login
// logout

/** 
 * ======
 * RESET 
 * ======
 * **/
// request code
router.post("/password/reset/request",validateBody(requestCodeSchema), requestCodeReset);
// verify
router.post("/password/reset/verify",validateBody(verifySchema), verifyReset);
// reset
router.patch("/password/reset",validateBody(resetSchema), reset);

/** 
 * ===============
 * VERIFY EMAIL 
 * ===============
 * */
// resend or request code
router.post("/email/verify/request",validateBody(requestCodeSchema), requestCodeVerifyEmail);
// verify
router.post("/email/verify", validateBody(verifySchema), verifyEmail);
export default router;