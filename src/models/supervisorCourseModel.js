import { Sequelize,DataTypes } from "sequelize";
import Database from "./../config/database.js"
import  sequelizePaginate  from "sequelize-paginate";
import Users from "./userModel.js";
import Courses from './courseModel.js';

const SupervisorCourses = Database.define("supervisor_course",
  {
    id:{
      type: DataTypes.BIGINT,
      allowNull:false,
      autoIncrement:true,
      primaryKey:true
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
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
      field:"course_id"
    },
    // - supervisor_id
    supervisorId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Coordinator ID is required!"
        }
      },
      references: {
        model: Users,
        key: "id"
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
      field:"supervisor_id"
    },
  },
  {
    timestamps: true,
    createdAt:false,
    updatedAt:false,
  }
);

sequelizePaginate.paginate(SupervisorCourses);
export default SupervisorCourses;