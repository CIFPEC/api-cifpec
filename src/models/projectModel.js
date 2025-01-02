import { Sequelize, DataTypes } from "sequelize";
import Database from "./../config/database.js"
import sequelizePaginate from "sequelize-paginate";
import Courses from "./courseModel.js";
import Batches from "./batchModel.js";

const Projects = Database.define("project",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    // - course_id
    course_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Course ID is required!"
        }
      },
      references: {
        model: Courses,
        key: "id"
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE"
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
    // - is_complete
    is_complete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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

sequelizePaginate.paginate(Projects);
export default Projects