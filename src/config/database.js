import "dotenv/config";
import { Sequelize } from "sequelize";

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