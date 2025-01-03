import { Sequelize, DataTypes } from "sequelize";
import Database from "./../config/database.js"
import sequelizePaginate from "sequelize-paginate";
import Users from "./userModel.js";

const Verifies = Database.define("verify",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    //  - user_id
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
    // - code
    verifyCode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Code is required!"
        }
      },
      field:"code"
    },
    // - email_verify
    verifyEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Email Verify is required!"
        }
      },
      field:"email_verify"
    },
    // - type
    verifyType: {
      type: DataTypes.ENUM("reset", "verify"),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Verify Type is required!"
        }
      },
      field:"type"
    },
    // - expired_at
    expiredAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Expired At is required!"
        }
      },
      field:"expired_at"
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

sequelizePaginate.paginate(Verifies);
export default Verifies