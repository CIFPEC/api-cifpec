import express from "express";
import "dotenv/config";
import router from "./src/routes/index.js";
import Models from "./src/models/index.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(router)


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`http://localhost:${port}`);
});