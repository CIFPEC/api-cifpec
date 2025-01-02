import { Sequelize } from "sequelize";
import "dotenv/config";

const db = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.USER,
  process.env.PASS,
  {
    host: process.env.HOST,
    dialect: process.env.DIALECT
  }
);

export default db;