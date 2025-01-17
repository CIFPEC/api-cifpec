import { ErrorHandler } from "./../exceptions/errorHandler.js";
import axios from "axios";
import jwt from 'jsonwebtoken';
import moment from "moment";

export function getRandomNumber(minimum, maximum) {
  const min = 10 ** (minimum - 1);
  const max = 10 ** maximum - 1;
  const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNum;
}

export async function getLocation(){
  try {
    const response = await axios.get("https://get.geojs.io/v1/ip/geo.json");
    return response.data;
  } catch (error) {
    throw new ErrorHandler(500, "Internal Server Error", error);
  }
}

export function getCodeWithToken(data,type,{min=5,max=6,expired=2}={}){
  if(expired && typeof expired !== "number"){
    throw new ErrorHandler(500)
  }
  const randomNum = getRandomNumber(min,max);
  const expiredTime = new Date(Date.now() + expired * 60 * 1000)
  const now = Date.now();
  const minutesExpired = moment(expiredTime);
  const inMinutes = minutesExpired.diff(now, 'minutes');

  const result = {
    code: randomNum,
    expiredTime,
    userId: data.userId,
    userEmail: data.userEmail,
    currentType: type,
    minutes: `${inMinutes} minutes`
  };

  if(type.value === "verify" || type.value === "reset"){ 
    const token = jwt.sign(data, process.env.VERIFY_KEY, { expiresIn:`${expired}m` });
    result.token = { [`${type.value}Token`]: token };
  }
  return result;
}

export function requestType (type){
  const validType = [
    {
      type: "email_verification",
      subject: "Email Verification Code",
      value: "verify",
      emailCode: "AUTH_VERIFY"
    },
    {
      type: "password_reset_request",
      subject: "Request Reset Password",
      value: "resetCode",
      emailCode: "RESET_PASSWORD"
    },
    {
      type: "email_register",
      subject: "Registration Verification Code",
      value: "verify",
      emailCode: "WELCOME"
    },
    {
      type: "password_reset",
      subject: "Reset Password",
      value: "reset",
      emailCode: "RESET_PASSWORD"
    }
  ]
  const currentType = validType.find(item => item.type === type);
  if(!currentType){
    throw new ErrorHandler(500,"Invalid request type");
  }
  return currentType;
}

export function getRole(){
  const ROLE = {
    ADMIN: 1,
    COORDINATOR: 2,
    SUPERVISOR: 3,
    WEB_MAINTENANCE: 4,
    STUDENT: 5,
  };

  return ROLE;
}