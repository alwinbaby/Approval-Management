
'use strict'
module.exports = (sequelize, DataTypes) => {
  var Applications = sequelize.define('Applications', {
    id: { type: DataTypes.INTEGER, field: 'id', primaryKey: true, autoIncrement: true },
    user_id: DataTypes.INTEGER,
    software_id: DataTypes.INTEGER,
    reason: DataTypes.STRING,
    approver_id: DataTypes.INTEGER,
    analyst_id: DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {
    timestamps: true,
    tableName: 'applications'
  })

  Applications.associate = function (models) {
    models.Applications.belongsTo(models.User, {
      foreignKey: 'user_id'
    })

    models.Applications.belongsTo(models.Software, {
      foreignKey: 'software_id'
    })

    models.Applications.belongsTo(models.Approvers, {
      foreignKey: 'approver_id'
    })
  }

  return Applications
}
