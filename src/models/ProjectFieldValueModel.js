import { Sequelize, DataTypes } from "sequelize";
import Database from "./../config/database.js"
import sequelizePaginate from "sequelize-paginate";
import Projects from "./projectModel.js";
import BatchFields from "./batchFieldModel.js";

const ProjectFieldValues = Database.define("project_field_value",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    // - project_id
    project_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Project ID is required!"
        }
      },
      references: {
        model: Projects,
        key: "id"
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE"
    },
    // - field_id
    field_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Field ID is required!"
        }
      },
      references: {
        model: BatchFields,
        key: "id"
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE"
    },
    // - value
    value: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Value is required!"
        }
      }
    },
  },
  {
    timestamps: true,
    createdAt: false,
    updatedAt: false,
  }
);

sequelizePaginate.paginate(ProjectFieldValues);
export default ProjectFieldValues;