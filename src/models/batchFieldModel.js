import { Sequelize, DataTypes } from "sequelize";
import Database from "./../config/database.js"
import sequelizePaginate from "sequelize-paginate";
import Batches from "./batchModel.js";

const BatchFields = Database.define("batch_field",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    // - batch_id
    batch_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Batch ID is required!"
        }
      },
      references: {
        model: Batches,
        key: "id"
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE"
    },
    // - field_name
    field_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Field Name is required!"
        }
      }
    },
    // - field_type
    field_type: {
      type: DataTypes.ENUM("text", "number", "date", "select", "radio", "checkbox", "file"),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Field Type is required!"
        }
      }
    },
    // - field_tag
    field_tag: {
      type: DataTypes.STRING,
    },
    // - is_required
    is_required: {
      type: DataTypes.BOOLEAN,
    },
    // - created_at
    // - updated_at 

  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

sequelizePaginate.paginate(BatchFields);
export default BatchFields;