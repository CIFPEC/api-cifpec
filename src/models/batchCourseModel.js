import { Sequelize, DataTypes } from "sequelize";
import Database from "./../config/database.js"
import sequelizePaginate from "sequelize-paginate";
import Batches from './batchModel.js';
import Courses from "./courseModel.js";

const BatchCourses = Database.define("batch_course",
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
      references:{
        model:Batches,
        key:"id"
      },
      field:"batch_id"
    },
    // - course_id
    courseId: {
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
      field:"course_id"
    },
  },
  {
    timestamps: true,
    createdAt: false,
    updatedAt: false,
  }
);

sequelizePaginate.paginate(BatchCourses);
export default BatchCourses;