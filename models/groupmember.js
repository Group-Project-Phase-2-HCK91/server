'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GroupMember extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      GroupMember.belongsTo(models.User, { foreignKey: 'UserId' });
      GroupMember.belongsTo(models.Group, { foreignKey: 'GroupId' });
      GroupMember.belongsTo(models.Message, { 
        foreignKey: 'LastReadMessageId',
        as: 'LastReadMessage' 
      });
    }
  }
  GroupMember.init({
    UserId: DataTypes.INTEGER,
    GroupId: DataTypes.INTEGER,
    LastReadMessageId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'GroupMember',
  });
  return GroupMember;
};