const bcrypt = require('bcrypt-nodejs')

module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, field: 'id', primaryKey: true, autoIncrement: true },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    type: DataTypes.STRING // User, approver, analyst
  }, {
    timestamps: false,
    tableName: 'users'
  })

  User.generateHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
  User.validPassword = (password, pass2) => bcrypt.compareSync(password, pass2)

  return User
}
