import { Sequelize, DataTypes } from "sequelize";
import Database from "./../config/database.js"
import sequelizePaginate from "sequelize-paginate";
import ProjectArchives from "./projectArchiveModel.js";

const ProjectValueArchives = Database.define("project_value_archive",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    // - project_id
    projectId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Project ID is required!"
        }
      },
      references: {
        model: ProjectArchives,
        key: "id"
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
      field:"project_id"
    },
    // - name
    projectName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Project Name is required!"
        }
      },
      field:"name"
    },
    // - value
    projectValue: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Project Value is required!"
        }
      },
      field:"value"
    },
  },
  {
    timestamps: true,
    createdAt: false,
    updatedAt: false,
  }
);

sequelizePaginate.paginate(ProjectValueArchives);
export default ProjectValueArchives;