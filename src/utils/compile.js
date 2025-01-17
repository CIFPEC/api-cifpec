import Handlebars from "handlebars";
import fs from "fs";
import { ErrorHandler } from './../exceptions/errorHandler.js';
import { emailAuthVerify, emailLoginVerify, emailRequestCode, emailResetPassword, emailWelcome } from "./template/email/index.js";
import { getLocation } from "./../utils/helper.js";
export const compile = async (data, type) => {
  // prepare data
  const basicData = {
    appName: process.env.APP_NAME,
    currentYear: new Date().getFullYear(),
    datetime: new Date().toLocaleString(),
  };
  const finalData = { ...basicData, ...data };

  // define template types
  const templateTypes = {
    "WELCOME" : emailWelcome,
    "AUTH_VERIFY": emailAuthVerify,
    "RESET_PASSWORD": emailResetPassword,
    "LOGIN_VERIFY": emailLoginVerify,
    "REQUEST_CODE": emailRequestCode,
  };
  // check if template type is valid
  if (!Object.keys(templateTypes).includes(type)) {
    throw new ErrorHandler(500, "Invalid template type");
  }

  try {
    // get country
    const geoData = await getLocation();
    finalData.country = geoData.country;
    
    // compile template
    const template = templateTypes[type];
    const compiledTemplate = Handlebars.compile(template);
    const htmlOutput = compiledTemplate(finalData);

    return htmlOutput;
  } catch (error) {
    if(error instanceof ErrorHandler) {
      throw error;
    }
    throw error;
  }
};