'use strict'
module.exports = (sequelize, DataTypes) => {
  var Software = sequelize.define('Software', {
    id: { type: DataTypes.INTEGER, field: 'id', primaryKey: true },
    name: DataTypes.STRING,
    acronym: DataTypes.STRING
  }, {
    timestamps: false,
    tableName: 'software'
  })

  Software.associate = function (models) {
    models.Software.belongsToMany(models.Approvers, {
      through: models.SoftwareApprover,
      foreignKey: 'software_id',
      otherKey: 'approver_id'
    })
  }

  return Software
}
