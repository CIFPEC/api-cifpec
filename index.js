import express from "express";
import "dotenv/config";
import router from "./src/routes/index.js";
import { middlewareError,sequelizeError } from "./src/validations/validation.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import "./src/utils/cronJob.js";
import corsOptions from "./src/utils/corsOptions.js";

const app = express();
const port = process.env.PORT || 3000;
const corsOption = corsOptions();


app.use(cors(corsOption));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);
app.use(sequelizeError);
app.use(middlewareError);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`http://localhost:${port}`);
});