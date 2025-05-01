import { Sequelize, DataTypes } from "sequelize";
import Database from "./../config/database.js"
import sequelizePaginate from "sequelize-paginate";
import Courses from "./courseModel.js";
import Batches from "./batchModel.js";
import Users from './userModel.js';

const Projects = Database.define("project",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    // - name
    projectName:{
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{
          msg:"Project Name is required!"
        }
      },
      field:"name"
    },
    // - thumbnail
    projectThumbnail:{
      type: DataTypes.STRING,
      defaultValue:null,
      field:"thumbnail"
    },
    // - supervisor_id
    supervisorId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Supervisor ID is required!"
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
    // - is_complete
    isComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field:"is_complete"
    },
    // - created_at
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field:"created_at",
    },
    // - updated_at
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field:"updated_at",
    }
  },
  {
    timestamps: true
  }
);

sequelizePaginate.paginate(Projects);
export default Projects