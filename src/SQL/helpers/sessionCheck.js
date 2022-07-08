const sessionCheck = (
  userId,
  sessionId,
  sessionKey,
  sql,
  crp,
) => new Promise((resolve) => {
  sql.query(`SELECT * FROM sessions WHERE id = '${sessionId}'`, (err, results) => {
    if (err) console.log(err)
    if (results[0]?.user_id === userId) {
      const [, salt] = results[0].session_key.split(':')
      crp.hash(sessionKey, salt).then((result) => {
        if (result === results[0]?.session_key) {
          resolve({
            status: 'confirms',
          })
        } else {
          resolve({
            status: 'denial',
          })
        }
      })
    }
  })
})

module.exports = sessionCheck
