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

// projects.course_id > courses.id
Projects.belongsTo(Courses, { foreignKey: "course_id" });
Courses.hasMany(Projects, { foreignKey: "course_id" });

// project_field_value.project_id < projects.id
ProjectFieldValues.belongsTo(Projects, { foreignKey: "project_id" });
Projects.hasMany(ProjectFieldValues, { foreignKey: "project_id" });

// project_field_value.field_id < batch_fields.id
BatchFields.hasMany(ProjectFieldValues, { foreignKey: "field_id" });
ProjectFieldValues.belongsTo(BatchFields, { foreignKey: "field_id" });

// batches.id < projects.batch_id
Projects.belongsTo(Batches, { foreignKey: "batch_id" });
Batches.hasMany(Projects, { foreignKey: "batch_id" });

// batch_fields.batch_id > batches.id
BatchFields.belongsTo(Batches, { foreignKey: "batch_id" });
Batches.hasMany(BatchFields, { foreignKey: "batch_id" });


// NOTE: batches to courses (many-to-many)
// Option A
// batches.id < batch_courses.batch_id
// BatchCourses.belongsTo(Batches, { foreignKey: "batch_id" });
// Batches.hasMany(BatchCourses, { foreignKey: "batch_id" });
// courses.id < batch_courses.course_id
// BatchCourses.belongsTo(Courses, { foreignKey: "course_id" });
// Courses.hasMany(BatchCourses, { foreignKey: "course_id" });
// Option B (many-to-many)
Batches.belongsToMany(Courses,{through:BatchCourses});
Courses.belongsToMany(Batches,{through:BatchCourses});

// NOTE: users to project (many-to-many)
// Option A
// users.id < project_members.user_id
// ProjectMembers.belongsTo(Users, { foreignKey: "user_id" });
// Users.hasMany(ProjectMembers, { foreignKey: "user_id" });
// projects.id > project_members.project_id
// ProjectMembers.belongsTo(Projects, { foreignKey: "project_id" });
// Projects.hasMany(ProjectMembers, { foreignKey: "project_id" });
// Option B (many-to-many) 
Projects.belongsToMany(Users,{through:ProjectMembers});
Users.belongsToMany(Projects,{through:ProjectMembers});

// (async () => {
//   try {
//     await Roles.sync();
//     await Courses.sync();
//     await Users.sync();
//     await UserDetails.sync();
//     await Verifies.sync();
//     await Batches.sync();
//     await Projects.sync();
//     await BatchFields.sync();
//     await ProjectFieldValues.sync();
//     await ProjectMembers.sync();
//     await BatchCourses.sync();
//     await SiteDetails.sync();
//   } catch (error) {
//     console.log(error);
//   }
// })();
(async () => {
  if(+process.env.MIGRATE_TABLE){
    try {
      await Database.sync({force:+process.env.MIGRATE_TYPE});
    } catch (error) {
      console.log(error);
    }
  }
  return;
})();



export default { Users, Verifies, Roles, UserDetails, Projects, BatchFields, ProjectFieldValues, ProjectMembers, Courses, Batches, BatchCourses, SiteDetails };