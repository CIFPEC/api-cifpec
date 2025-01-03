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
    batchId: {
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
      onUpdate: "CASCADE",
      field:"batch_id"
    },
    // - field_name
    fieldName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Field Name is required!"
        }
      },
      field:"field_name"
    },
    // - field_type
    fieldType: {
      type: DataTypes.ENUM("text", "number", "date", "select", "radio", "checkbox", "file"),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Field Type is required!"
        }
      },
      field:"field_type"
    },
    // - field_tag
    fieldTag: {
      type: DataTypes.STRING,
      field:"field_tag"
    },
    // - is_required
    isRequired: {
      type: DataTypes.BOOLEAN,
      field:"is_required"
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