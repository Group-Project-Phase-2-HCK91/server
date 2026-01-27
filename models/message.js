'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Message.belongsTo(models.User, { foreignKey: 'SenderId' });
      Message.belongsTo(models.Group, { foreignKey: 'GroupId' });
    }
  }
  Message.init({
    content: DataTypes.TEXT,
    isAiGenerated: DataTypes.BOOLEAN,
    SenderId: DataTypes.INTEGER,
    GroupId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Message',
  });
  return Message;
};