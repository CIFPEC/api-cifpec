import { Sequelize, DataTypes } from "sequelize";
import Database from "./../config/database.js"
import sequelizePaginate from "sequelize-paginate";

const SiteDetails = Database.define("site_detail",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    //  - title
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Title is required!"
        }
      }
    },
    // - logo
    logo: DataTypes.STRING,
    // - banner
    banner: DataTypes.STRING,
    // - text_header
    text_header: DataTypes.STRING,
    // - description
    description: DataTypes.STRING,
    // - updated_at
  },
  {
    timestamps: true,
    createdAt: false,
    updatedAt: "updated_at",
  }
);

sequelizePaginate.paginate(SiteDetails);
export default SiteDetails;