import { Sequelize, DataTypes } from "sequelize";
import Database from "./../config/database.js"
import sequelizePaginate from "sequelize-paginate";
import Users from "./userModel.js";
import Courses from "./courseModel.js";

const UserDetails = Database.define("user_detail",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    // - user_id
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "User ID is required!"
        }
      },
      references: {
        model: Users,
        key: "id"
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE"
    },
    // - username
    username: {
      type: DataTypes.STRING,
    },
    // - gender
    gender: {
      type: DataTypes.ENUM("male", "female"),
    },
    // - phone_number
    phone_number: {
      type: DataTypes.STRING,
    },
    // - nickname
    nickname: {
      type: DataTypes.STRING,
    },
    // - course_id
    course_id: {
      type: DataTypes.BIGINT,
      defaultValue: null,
      references: {
        model: Courses,
        key: "id"
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE"
    },
    // - is_final
    is_final: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  },
  {
    timestamps: true,
    createdAt: false,
    updatedAt: false,
  }
);

sequelizePaginate.paginate(UserDetails);
export default UserDetails