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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Email is required!"
        },
        unique: {
          args: true,
          msg: "Email already exists!"
        },
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Password is required!"
        }
      }
    },
    role_id: {
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
      onUpdate: "CASCADE"
    },
    is_varify: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_lecturer_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_admin_approve: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_lecturer_request: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // - created_at
    // - updated_at
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

sequelizePaginate.paginate(Users);
export default Users