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

// users.id - user_details.user_id
Users.hasOne(UserDetails, { foreignKey: "user_id" });
UserDetails.belongsTo(Users, { foreignKey: "user_id" });

// users.role_id > roles.id
Roles.hasMany(Users, { foreignKey: "role_id" });
Users.belongsTo(Roles, { foreignKey: "role_id" });

// users.id - verify.user_id
Users.hasOne(Verifies, { foreignKey: "user_id" });
Verifies.belongsTo(Users, { foreignKey: "user_id" });

// user_details.course_id > courses.id
UserDetails.belongsTo(Courses, { foreignKey: "course_id" });
Courses.hasMany(UserDetails, { foreignKey: "course_id" });

// users.id < sessions.user_id
Sessions.belongsTo(Users,{foreignKey:"user_id"});
Users.hasMany(Sessions,{foreignKey:"user_id"});

// projects.course_id > courses.id
Projects.belongsTo(Courses, { foreignKey: "course_id" });
Courses.hasMany(Projects, { foreignKey: "course_id" });

// batches.id < projects.batch_id
Projects.belongsTo(Batches, { foreignKey: "batch_id" });
Batches.hasMany(Projects, { foreignKey: "batch_id" });

// batch_fields.batch_id > batches.id
BatchFields.belongsTo(Batches, { foreignKey: "batch_id" });
Batches.hasMany(BatchFields, { foreignKey: "batch_id" });

// courses.coordinator_id - users.id
Courses.belongsTo(Users,{foreignKey:"coordinator_id"});
Users.hasOne(Courses,{foreignKey:"coordinator_id"});

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
Option A
project_field_value.project_id < projects.id 
ProjectFieldValues.belongsTo(Projects, { foreignKey: "project_id" });
Projects.hasMany(ProjectFieldValues, { foreignKey: "project_id" });
project_field_value.field_id < batch_fields.id
BatchFields.hasMany(ProjectFieldValues, { foreignKey: "field_id" });
ProjectFieldValues.belongsTo(BatchFields, { foreignKey: "field_id" });

Option B (Many-to-many)
*/
Projects.belongsToMany(BatchFields,{through:ProjectFieldValues});
BatchFields.belongsToMany(Projects,{through:ProjectFieldValues});


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
Courses.belongsToMany(Users,{through:SupervisorCourses});
Users.belongsToMany(Courses,{through:SupervisorCourses});

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
Batches.belongsToMany(Courses,{through:BatchCourses});
Courses.belongsToMany(Batches,{through:BatchCourses});

/* 
NOTE: users to project (many-to-many)
=====================================
Option A
users.id < project_members.user_id
ProjectMembers.belongsTo(Users, { foreignKey: "user_id" });
Users.hasMany(ProjectMembers, { foreignKey: "user_id" });
projects.id > project_members.project_id
ProjectMembers.belongsTo(Projects, { foreignKey: "project_id" });
Projects.hasMany(ProjectMembers, { foreignKey: "project_id" });

Option B (many-to-many) 
*/
Projects.belongsToMany(Users,{through:ProjectMembers});
Users.belongsToMany(Projects,{through:ProjectMembers});

(async () => {
  if(+process.env.MIGRATE_TABLE){
    const roles = [
      {roleName:"admin"},
      {roleName:"coordinator"},
      {roleName:"supervisor"},
      {roleName:"web Maintenance"},
      {roleName:"student"},
    ];
    await Roles.bulkCreate(roles);
    await Courses.create({courseName:"Web Development"});
    try {
      await Database.sync({force:+process.env.MIGRATE_TYPE});
    } catch (error) {
      console.log(error);
    }
  }
  return;
})();



export { Database, Users, Verifies, Roles, UserDetails, Projects, BatchFields, ProjectFieldValues, ProjectMembers, Courses, Batches, BatchCourses, SiteDetails, ProjectArchives, ProjectMemberArchives, ProjectValueArchives, SupervisorCourses, Sessions };