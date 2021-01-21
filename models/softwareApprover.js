
'use strict'
module.exports = (sequelize, DataTypes) => {
  var SoftwareApprover = sequelize.define('SoftwareApprover', {
    id: { type: DataTypes.INTEGER, field: 'id', primaryKey: true },
    approverId: { type: DataTypes.INTEGER, field: 'approver_id' },
    softwareId: { type: DataTypes.INTEGER, field: 'software_id' }
  }, {
    timestamps: false,
    tableName: 'software_approver'
  })

  return SoftwareApprover
}
