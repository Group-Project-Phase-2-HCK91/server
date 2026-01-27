'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Message, { foreignKey: 'SenderId' });
      User.belongsToMany(models.Group, { through: models.GroupMember, foreignKey: 'UserId' });
    }
  }
  User.init({
    username: {
      type:DataTypes.STRING,
      allowNull: false, 
      validate: {
        notNull: { 
          msg: 'Username is required'
         },
        notEmpty: { 
          msg: 'Username is required' 
        }
      }
    },
    email: {
      type:DataTypes.STRING,
      unique: {
        args: true,
        msg: 'Email address already exists !'
      },
      validate: {
        isEmail: {
          msg: 'Email format is invalid'
        },
        notEmpty: {
          msg: 'Email is required'
        },
        notNull: {
          msg: 'Email is required'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Password is required'
        },
        notEmpty: {
          msg: 'Password is required'
        },
        len : {
          args: [6], 
          msg: 'Password must be at least 6 characters long'
        }
      }
    },
    imgUrl: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};