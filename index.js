import express from "express";
import "dotenv/config";
import router from "./src/routes/index.js";
import { middlewareError,sequelizeError } from "./src/validations/validation.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(router)
app.use(sequelizeError);
app.use(middlewareError);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`http://localhost:${port}`);
});