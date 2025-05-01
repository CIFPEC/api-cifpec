import Users from "./userModel.js";
import Verifies from "./verifyModel.js";
import Roles from "./roleModel.js";
import UserDetails from './userDetailModel.js';
import Projects from './projectModel.js';
import BatchFields from './batchFieldModel.js';
import ProjectFieldValues from "./ProjectFieldValueModel.js";
import ProjectMembers from "./ProjectMemberModel.js";
import Courses from "./courseModel.js";
import Batches from "./batchModel.js";
import BatchCourses from "./batchCourseModel.js";
import SiteDetails from "./SiteDetailModel.js";
import Database from "./../config/database.js";
import "dotenv/config";
import ProjectMemberArchives from './ProjectMemberArchiveModel.js';
import ProjectArchives from "./projectArchiveModel.js";
import ProjectValueArchives from './ProjectValueArchiveModel.js';
import SupervisorCourses from './supervisorCourseModel.js';
import Sessions from "./sessionModel.js";
import { Create_Roles, Create_Courses } from "./../utils/autoCreate.js";

// users.id - user_details.user_id
Users.hasOne(UserDetails, { foreignKey: "user_id", as: "Profile" });
UserDetails.belongsTo(Users, { foreignKey: "user_id", as: "User" });

// users.role_id > roles.id
Roles.hasMany(Users, { foreignKey: "role_id", as: "Users" });
Users.belongsTo(Roles, { foreignKey: "role_id", as: "Role" });

// users.id - verify.user_id
Users.hasOne(Verifies, { foreignKey: "user_id", as: "Verification",onDelete: "CASCADE", onUpdate: "CASCADE" });
Verifies.belongsTo(Users, { foreignKey: "user_id", as: "User",onDelete: "CASCADE", onUpdate: "CASCADE" });

// user_details.course_id > courses.id
UserDetails.belongsTo(Courses, { foreignKey: "course_id", as: "EnrolledCourse" });
Courses.hasMany(UserDetails, { foreignKey: "course_id", as: "Students" });

// users.id < sessions.user_id
Users.hasMany(Sessions, { foreignKey: "user_id", as: "Sessions" });
Sessions.belongsTo(Users, { foreignKey: "user_id", as: "User" });

// projects.course_id > courses.id
Projects.belongsTo(Courses, { foreignKey: "course_id", as: "ProjectCourse" });
Courses.hasMany(Projects, { foreignKey: "course_id", as: "Projects" });

// projects.supervisor_id > users.id
Projects.belongsTo(Users, { foreignKey: "supervisor_id", as: "Supervisor" });
Users.hasMany(Projects, { foreignKey: "supervisor_id", as: "SupervisedProjects" });

// batches.id < projects.batch_id
Projects.belongsTo(Batches, { foreignKey: "batch_id", as: "Batch" });
Batches.hasMany(Projects, { foreignKey: "batch_id", as: "Projects" });

// batch_fields.batch_id > batches.id
BatchFields.belongsTo(Batches, { foreignKey: "batch_id", as: "Batch" });
Batches.hasMany(BatchFields, { foreignKey: "batch_id", as: "projectRequirements" });

// courses.coordinator_id - users.id
Courses.belongsTo(Users,{foreignKey:"coordinator_id",as:"Coordinator"});
Users.hasOne(Courses,{foreignKey:"coordinator_id",as:"ManagedCourse"});

// ARCHIVE TABLE
// =============
// project_members_archives.project_id > project_archive.id
ProjectMemberArchives.belongsTo(ProjectArchives,{foreignKey:"project_id"});
ProjectArchives.hasMany(ProjectMemberArchives,{foreignKey:"project_id"});

// project_members_archives.user_id < user_details.user_id
ProjectMemberArchives.belongsTo(UserDetails,{foreignKey:"user_id"});
UserDetails.hasMany(ProjectMemberArchives,{foreignKey:"user_id"});

// project_value_archives.project_id < project_archives.id
ProjectValueArchives.belongsTo(ProjectArchives,{foreignKey:"project_id"});
ProjectArchives.hasMany(ProjectValueArchives,{foreignKey:"project_id"});

/*
NOTE projects to batch_fields (many-to-many)
============================================
*/

// project_field_value.project_id < projects.id 
ProjectFieldValues.belongsTo(Projects, { foreignKey: "project_id",as:"Project" });
Projects.hasMany(ProjectFieldValues, { foreignKey: "project_id",as:"ProjectFieldValues" });

// batch_fields.id < project_field_value.field_id
BatchFields.hasMany(ProjectFieldValues, { foreignKey: "field_id",as:"ProjectFieldValues" });
ProjectFieldValues.belongsTo(BatchFields, { foreignKey: "field_id",as:"BatchField" });

Projects.belongsToMany(BatchFields, { through: ProjectFieldValues, as:"BatchFields",foreignKey:"project_id",otherKey:"field_id"});
BatchFields.belongsToMany(Projects,{through:ProjectFieldValues,as:"Projects",foreignKey:"field_id",otherKey:"project_id"}); 

/*
NOTE: users to courses (many-to-many)
====================================
Option A
supervisor_courses.course_id > courses.id
SupervisorCourses.belongsTo(Courses,{foreignKey:"course_id"});
Courses.hasMany(SupervisorCourses,{foreignKey:"course_id"});
supervisor_courses.supervisor_id > users.id
SupervisorCourses.belongsTo(Users,{foreignKey:"supervisor_id"});
Users.hasMany(SupervisorCourses,{foreignKey:"supervisor_id"});

Option B (Many-to-many)
*/
Courses.belongsToMany(Users,{through:SupervisorCourses,as:"Supervisors",foreignKey:"course_id",otherKey:"supervisor_id"});
Users.belongsToMany(Courses,{through:SupervisorCourses,as:"Courses",foreignKey:"supervisor_id",otherKey:"course_id"});

/* NOTE: batches to courses (many-to-many)
==========================================
Option A
batches.id < batch_courses.batch_id
BatchCourses.belongsTo(Batches, { foreignKey: "batch_id" });
Batches.hasMany(BatchCourses, { foreignKey: "batch_id" });
courses.id < batch_courses.course_id
BatchCourses.belongsTo(Courses, { foreignKey: "course_id" });
Courses.hasMany(BatchCourses, { foreignKey: "course_id" });

Option B (many-to-many)
*/ 
Batches.belongsToMany(Courses, { through: BatchCourses, as: "batchCourses" ,onDelete: "CASCADE", onUpdate: "CASCADE" });
Courses.belongsToMany(Batches, { through: BatchCourses, as: "coursesInBatch" ,onDelete: "CASCADE", onUpdate: "CASCADE" });

/* 
NOTE: users to project (many-to-many)
=====================================
*/

// users.id < project_members.user_id
Users.hasMany(ProjectMembers, { foreignKey: "user_id", as: "ProjectMembers" });
ProjectMembers.belongsTo(Users, { foreignKey: "user_id", as: "User" });

// projects.id > project_members.project_id
Projects.hasMany(ProjectMembers, { foreignKey: "project_id", as: "ProjectMembers" });
ProjectMembers.belongsTo(Projects, { foreignKey: "project_id", as: "Project" });

Projects.belongsToMany(Users,{through:ProjectMembers, as:"Teams",foreignKey:"project_id",otherKey:"user_id"});
Users.belongsToMany(Projects,{through:ProjectMembers, as:"Projects",foreignKey:"user_id",otherKey:"project_id"});

(async () => {
  if(+process.env.MIGRATE_TABLE){
    try {
      // check if migrate table is true, if true then recreate the table with new schema
      if (+process.env.MIGRATE_TYPE){
        await Database.sync({force: true});
        const ROLES = Create_Roles();
        const COURSES = Create_Courses();
        await Roles.bulkCreate(ROLES);
        await Courses.bulkCreate(COURSES);
      }else{
        await Database.sync({force: false});
      }
    } catch (error) {
      console.log(error);
    }
  }
  return;
})();



export {
  Database,
  Users as UserModel,
  Verifies as VerifyModel,
  Roles as RoleModel,
  UserDetails as UserDetailModel,
  Projects as ProjectModel,
  BatchFields as BatchFieldModel,
  ProjectFieldValues as ProjectFieldValueModel,
  ProjectMembers as ProjectMemberModel,
  Courses as CourseModel,
  Batches as BatchModel,
  BatchCourses as BatchCourseModel,
  SiteDetails as SiteDetailModel,
  ProjectArchives as ProjectArchiveModel,
  ProjectMemberArchives as ProjectMemberArchiveModel,
  ProjectValueArchives as ProjectValueArchiveModel,
  SupervisorCourses as SupervisorCourseModel,
  Sessions as SessionModel 
};