import { DataTypes } from 'sequelize';
import Database from '../config/database.js';
import sequelizePaginate from "sequelize-paginate";

const Categories = Database.define('categories', {
  id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  categoryName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'name',
  },
  categoryCode: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    validate: {
      notNull: {
        msg: 'Category Code is required!',
      },
    },
    field: 'code',
  },
});

sequelizePaginate.paginate(Categories);
export default Categories;
