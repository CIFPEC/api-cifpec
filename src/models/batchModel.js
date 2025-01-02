import { Sequelize, DataTypes } from "sequelize";
import Database from "./../config/database.js"
import sequelizePaginate from "sequelize-paginate";

const Batches = Database.define("batch",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    //  - name
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Name is required!"
        }
      }
    },
    // - start_date
    start_date: DataTypes.DATE,
    // - end_date
    end_date: DataTypes.DATE,
    // - is_final
    is_final: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // - last_update
    last_update: DataTypes.DATE,
    // - created_at
    // - updated_at

  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

sequelizePaginate.paginate(Batches);
export default Batches;