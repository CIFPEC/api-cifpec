import { Sequelize } from "sequelize";
import "dotenv/config";
import fs from 'fs';

const db = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.USER,
  process.env.PASS,
  {
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    timezone: process.env.TIME_ZONE,
    // logging: (msg) => fs.appendFileSync('sequelize.log', msg + '\n')
    logging: false
  }
);

export default db;