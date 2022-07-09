/* eslint-disable no-unreachable */
const sessionCheck = require('../helpers/sessionCheck.js')

const getDialogListFunction = (
  userId,
  sessionId,
  sessionKey,
  sql,
  crp,
) => new Promise((resolve) => {
  sessionCheck(userId, sessionId, sessionKey, sql, crp).then((response) => {
    if (response.status === 'confirms') {
      sql.query('SELECT * FROM messages', async (err, results) => {
        if (err) console.log(err)
        resolve({
          status: 'get_dialog_list',
          messages: [...results],
        })
      })
    }
  })
})

module.exports = getDialogListFunction
