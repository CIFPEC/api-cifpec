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
    batchName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Batch Name is required!"
        }
      },
      field:"name"
    },
    // - start_date
    startDate: {
      type:DataTypes.DATE,
      field:"start_date"
    },
    // - end_date
    endDate: {
      type:DataTypes.DATE,
      field:"end_date"
    },
    // - is_final
    isFinal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field:"is_final"
    },
    // - last_update
    lastUpdate: {
      type:DataTypes.DATE,
      field:"last_update"
    },
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