'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Group.belongsToMany(models.User, { through: models.GroupMember, foreignKey: 'GroupId', as: 'Members' });
      Group.belongsTo(models.User, { as: 'Admin', foreignKey: 'AdminId' });
      Group.belongsTo(models.Message, { as: 'LastMessage', foreignKey: 'LastMessageId' })
      Group.hasMany(models.Message, { foreignKey: 'GroupId', as: 'Messages' });
    }
  }
  Group.init({
    name: DataTypes.STRING,
    type: DataTypes.ENUM,
    AdminId: DataTypes.INTEGER,
    LastMessageId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};