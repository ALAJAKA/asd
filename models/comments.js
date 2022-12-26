'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Comment.init({
    commentId :{
      primaryKey :true,
      type:DataTypes.INTEGER,
    },
    postId:{
      notnull :true,
      type:DataTypes.INTEGER,
    },
    userId:{
      notnull :true,
      type:DataTypes.INTEGER,
    },
    comment:{
      notnull :true,
      type:DataTypes.STRING,
    },
    nickname:{
      notnull :true,
      type:DataTypes.STRING,
    },

  }, {
    sequelize,
    modelName: 'Comment',
  });
  return Comment;
};