import { Sequelize,DataTypes } from "sequelize";
import Database from "./../config/database.js"
import  sequelizePaginate  from "sequelize-paginate";

const Courses = Database.define("course",
  {
    id:{
      type: DataTypes.BIGINT,
      allowNull:false,
      autoIncrement:true,
      primaryKey:true
    },
    //  - name
    name:{
      type: DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{
          msg:"Name is required!"
        }
      }
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