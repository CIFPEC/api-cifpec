import { Sequelize, DataTypes } from "sequelize";
import Database from "./../config/database.js"
import sequelizePaginate from "sequelize-paginate";
import Users from "./userModel.js";

const Sessions = Database.define("session",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    //  - user_id
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "User ID is required!"
        }
      },
      references:{
        model:Users,
        key:"id"
      },
      field:"user_id"
    },
    // - session_token(unique)
    sessionToken: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Token is required!"
        }
      },
      field:"session_token"
    },
    // - device_name
    deviceName: {
      type: DataTypes.STRING,
      field:"device_name"
    },
    // - device_type
    deviceType: {
      type: DataTypes.STRING,
      field:"device_type"
    },
    // - ip_address
    ipAddress: {
      type: DataTypes.STRING,
      field:"ip_address"
    },
    // - location
    location: {
      type: DataTypes.STRING,
      field:"location"
    },
    // - user_agent
    userAgent: {
      type: DataTypes.STRING,
      field:"user_agent"
    },
    // - last_active
    lastActive: {
      type: DataTypes.DATE,
      field:"last_active"
    },
    // - expiry_time
    expiryTime: {
      type: DataTypes.DATE,
      field:"expiry_time"
    },
    // - is_active
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field:"is_active"
    },
    // - failed_attempts
    failedAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field:"failed_attempts"
    },
    // - login_time
  },
  {
    timestamps: true,
    createdAt:"login_time",
    updatedAt: false,
  }
);

sequelizePaginate.paginate(Sessions);
export default Sessions;