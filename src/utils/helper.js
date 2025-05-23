import { ErrorHandler } from "./../exceptions/errorHandler.js";
import axios from "axios";
import jwt from 'jsonwebtoken';
import moment from "moment";
import { geojs } from "./localMode.js";
import fs from 'fs/promises';

export function getRandomNumber(minimum, maximum) {
  const min = 10 ** (minimum - 1);
  const max = 10 ** maximum - 1;
  const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNum;
}

export async function getLocation(){
  let response;
  try {
    if (process.env.ENVIROMENT_MODE === "Development") {
      response = await geojs();
    }else{
      response = await axios.get("https://get.geojs.io/v1/ip/geo.json");
    }
    return response.data;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      // Timeout berlaku
      throw new ErrorHandler(504,"Gateway Timeout",[{ message: "Request Timeout. API too slow." }]);
    } else if (error.response) {
      // API luar reply dengan error
      throw new ErrorHandler(502,"Bad Gateway",[{ message: "Bad Gateway. API error.", error: error.response.data }]);
    } else {
      // API luar langsung tak boleh dihubungi
      throw new ErrorHandler(503,"Service Unavailable",[{ message: "Service Unavailable. API unreachable." }]);
    }
  }
}

export function getCodeWithToken(data,type,{min=5,max=6,expired=2}={}){
  if(expired && typeof expired !== "number"){
    throw new ErrorHandler(500,"Internal Server Error",[{ message: "Expired must be a number." }]);
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
      type: "email_register",
      subject: "Registration Verification Code",
      value: "verify",
      emailCode: "WELCOME"
    },
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
      type: "password_reset",
      subject: "Reset Password",
      value: "reset",
      emailCode: "RESET_PASSWORD"
    },
    {
      type: "email_login",
      subject: "Login Verification Code",
      value: "verify",
      emailCode: "LOGIN_VERIFY"
    }
  ]
  const currentType = validType.find(item => item.type === type);
  if(!currentType){
    throw new ErrorHandler(500,"Internal Server Error",[
      {
        message: "Invalid request type"
      }
    ]);
  }
  return currentType;
}

export function getRole(){
  const ROLE = {
    ADMIN: 1,
    WEB_MAINTENANCE: 2,
    COORDINATOR: 3,
    SUPERVISOR: 4,
    STUDENT: 5,
  };

  return ROLE;
}

export function CreateAccessToken({userId,userEmail,roleId,roleName,courseId,batchId}){
  const AccessToken = jwt.sign({ userId, userEmail, roleId, roleName, courseId, batchId }, process.env.ACCESS_KEY, { expiresIn:"40s" });
  return AccessToken;
}

export async function checkIfExists(path) {
  try {
    await fs.access(path);
    return true; // Exist
  } catch (err) {
    return false; // Not exist
  }
}