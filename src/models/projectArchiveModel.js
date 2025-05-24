import { Sequelize, DataTypes } from "sequelize";
import Database from "./../config/database.js"
import sequelizePaginate from "sequelize-paginate";

const ProjectArchives = Database.define("project_archive",
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
      unique: true,
      validate: {
        notNull: {
          msg: "Project ID is required!"
        }
      },
      field:"project_id",
    },
    // - project_name
    projectName:{
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{
          msg:"Project Name is required!"
        }
      },
      field:"project_name"
    },
    // - project_thumbnail
    projectThumbnail:{
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Project Thumbnail is required!"
        }
      },
      field:"project_thumbnail"
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
      field:"batch_id"
    },
    // - batch_name
    batchName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Batch Name is required!"
        }
      },
      field:"batch_name"
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
      field:"course_id"
    },
    // course_name
    courseName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Course Name is required!"
        }
      },
      field:"course_name"
    },
    // course_coordinator_name
    courseCoordinatorName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Coordinator Name is required!"
        }
      },
      field:"course_coordinator_name"
    },
    // - project_supervisor_id
    courseSupervisorId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Supervisor ID is required!"
        }
      },
      field: "project_supervisor_id"
    },
    // project_supervisor_name
    courseSupervisorName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Supervisor Name is required!"
        }
      },
      field:"project_supervisor_name"
    },
    // project_created_at
    projectCreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Project Created Date is required!"
        }
      },
      field:"project_created_at"
    },
    // project_requirements
    projectRequirements: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Project Requirement ID is required!"
        }
      },
      field:"project_requirements"
    },
    // project_team_members
    projectTeamMembers: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Project Members ID is required!"
        }
      },
      field:"project_team_members"
    },
    // - isinal
    isFinal: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field:"is_final"
    }
  },
  {
    timestamps: true,
    createdAt: false,
    updatedAt: false,
  }
);

sequelizePaginate.paginate(ProjectArchives);
export default ProjectArchives;