import express from "express";

const app = express();
const port = 5000;

app.use(express.json());

app.listen(5000, () => {
  console.log(`Server running on port ${port}`);
  console.log(`http://localhost:${port}`);
});