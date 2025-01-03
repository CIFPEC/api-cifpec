import { Sequelize, DataTypes } from "sequelize";
import Database from "./../config/database.js"
import sequelizePaginate from "sequelize-paginate";
import ProjectArchives from "./projectArchiveModel.js";
import UserDetails from "./userDetailModel.js";

const ProjectMemberArchives = Database.define("project_members_archive",
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
    // - user_id
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "User ID is required!"
        }
      },
      references: {
        model: UserDetails,
        key: "user_id"
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
      field:"user_id"
    }
  },
  {
    timestamps: true,
    createdAt: false,
    updatedAt: false,
  }
);

sequelizePaginate.paginate(ProjectMemberArchives);
export default ProjectMemberArchives;