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
    userId: {
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
      onUpdate: "CASCADE",
      field:"user_id"
    },
    // - username
    username: {
      type: DataTypes.STRING,
    },
    // - gender
    userGender: {
      type: DataTypes.ENUM("male", "female"),
      field:"gender"
    },
    // - phone_number
    userPhone: {
      type: DataTypes.STRING,
      field:"phone_number"
    },
    // - nickname
    userNickname: {
      type: DataTypes.STRING,
      field:"nickname"
    },
    // - course_id
    courseId: {
      type: DataTypes.BIGINT,
      defaultValue: null,
      references: {
        model: Courses,
        key: "id"
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
      field:"course_id"
    },
    // - is_final
    isFinal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field:"is_final"
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