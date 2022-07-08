const crp = require('../crypto.js')
const registerUserFunction = require('./customMethods/registerUser.js')
const authenticationFunction = require('./customMethods/authentication.js')
const sessionTerminationFunction = require('./customMethods/sessionTermination.js')
const sendMessageFunction = require('./customMethods/sendMessage.js')

const extendSQL = (sql) => {
  const extendedSQL = sql

  extendedSQL.registerUser = (
    email,
    login,
    password,
  ) => registerUserFunction(email, login, password, extendedSQL, crp)

  extendedSQL.authentication = (
    emailOrLogin,
    password,
  ) => authenticationFunction(emailOrLogin, password, extendedSQL, crp)

  extendedSQL.sessionTermination = (
    userId,
    sessionId,
    sessionKey,
  ) => { sessionTerminationFunction(userId, sessionId, sessionKey, extendedSQL, crp) }

  extendedSQL.sendMessage = (
    userId,
    sessionId,
    sessionKey,
    message,
  ) => sendMessageFunction(
    userId,
    sessionId,
    sessionKey,
    message,
    extendedSQL,
    crp,
  )

  return extendedSQL
}

module.exports = extendSQL
