import { Sequelize, DataTypes } from "sequelize";
import Database from "./../config/database.js"
import sequelizePaginate from "sequelize-paginate";
import Roles from "./roleModel.js";

const Users = Database.define("user",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    // - name
    userName: {
      type: DataTypes.STRING,
      field:"name"
    },
    // - email
    userEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: "Email already exists!"
      },
      validate: {
        notNull: {
          msg: "Email is required!"
        },
      },
      field:"email"
    },
    // - password
    userPassword: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Password is required!"
        }
      },
      field:"password"
    },
    // - role_id
    roleId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Role is required!"
        }
      },
      references: {
        model: Roles,
        key: "id"
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
      field:"role_id"
    },
    // - is_verify
    isVerify: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field:"is_verify"
    },
    // - is_lecturer_active
    isLecturerActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field:"is_lecturer_active"
    },
    // - is_admin_approve
    isAdminApprove: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field:"is_admin_approve"
    },
    // - is_lecturer_request
    isLecturerRequest: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field:"is_lecturer_request"
    },
    // - created_at
    createdAt: {
      type: DataTypes.DATE,
      field:"created_at",
      defaultValue: DataTypes.NOW
    }
    // - updated_at
  },
  {
    timestamps: true,
    // createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

sequelizePaginate.paginate(Users);
export default Users