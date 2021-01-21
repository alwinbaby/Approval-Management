
'use strict'
module.exports = (sequelize, DataTypes) => {
  var Approvers = sequelize.define('Approvers', {
    id: { type: DataTypes.INTEGER, field: 'id', primaryKey: true },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING
  }, {
    timestamps: false,
    tableName: 'approvers'
  })

  Approvers.associate = function (models) {
    models.Approvers.belongsToMany(models.Software, {
      through: models.SoftwareApprover,
      foreignKey: 'approver_id',
      otherKey: 'software_id'
    })
  }

  return Approvers
}
