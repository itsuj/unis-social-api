module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define("Message", {
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    });
  
    Message.associate = (models) => {
      // Define associations if necessary
      Message.belongsTo(models.Users, { as: 'sender', foreignKey: 'senderId' });
      Message.belongsTo(models.Users, { as: 'receiver', foreignKey: 'receiverId' });
      // Add more associations here if needed
    };
  
    return Message;
  };
  
  