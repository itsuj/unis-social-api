module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define("Users", {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  
  });

  Users.associate = (models) => {
    // Define associations if necessary
    Users.hasMany(models.Likes, {
      onDelete: "cascade",
    });
    Users.hasMany(models.Posts, {
      onDelete: "cascade",
    });
    // Add more associations here if needed
  };

  return Users;
};
