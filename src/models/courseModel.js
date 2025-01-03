import { Sequelize,DataTypes } from "sequelize";
import Database from "./../config/database.js"
import  sequelizePaginate  from "sequelize-paginate";
import Users from "./userModel.js";

const Courses = Database.define("course",
  {
    id:{
      type: DataTypes.BIGINT,
      allowNull:false,
      autoIncrement:true,
      primaryKey:true
    },
    //  - name
    courseName:{
      type: DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{
          msg:"Course Name is required!"
        }
      },
      field:"name"
    },
    // - coordinator_id
    coordinatorId: {
      type: DataTypes.BIGINT,
      references: {
        model: Users,
        key: "id"
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
      field:"coordinator_id"
    },
  },
  {
    timestamps: true,
    createdAt:"created_at",
    updatedAt:"updated_at",
  }
);

sequelizePaginate.paginate(Courses);
export default Courses;