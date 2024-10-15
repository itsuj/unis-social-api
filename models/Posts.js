const path = require('path');
const cors = require('cors');

module.exports = (sequelize, DataTypes) => {
  const Posts = sequelize.define("Posts", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postText: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    file: {
      type: DataTypes.STRING, // Changed data type to STRING
      allowNull: true, // or false depending on your requirements
    },
  });

  Posts.associate = (models) => {
    Posts.hasMany(models.Comments, {
      onDelete: "cascade",
    });

    Posts.hasMany(models.Likes, {
      onDelete: "cascade",
    });
  };

  // Define a method to get the full image URL
  Posts.prototype.getImageUrl = function() {
    if (!this.file) {
      return null;
    }
    return `/uploads/${this.file}`; // Assuming images are stored in /uploads directory
  };
  return Posts;
};
