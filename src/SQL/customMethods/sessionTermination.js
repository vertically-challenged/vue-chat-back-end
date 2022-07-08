const sessionCheck = require('../helpers/sessionCheck.js')

const sessionTerminationFunction = (
  userId,
  sessionId,
  sessionKey,
  sql,
  crp,
) => {
  sessionCheck(userId, sessionId, sessionKey, sql, crp).then((response) => {
    if (response.status === 'confirms') {
      sql.query(`DELETE FROM sessions WHERE id = '${sessionId}'`)
    }
  })
}

module.exports = sessionTerminationFunction
