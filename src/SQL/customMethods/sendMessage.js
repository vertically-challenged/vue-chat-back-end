/* eslint-disable no-unreachable */
const sessionCheck = require('../helpers/sessionCheck.js')

const sendMessageFunction = (
  userId,
  sessionId,
  sessionKey,
  message,
  sql,
  crp,
) => new Promise((resolve) => {
  sessionCheck(userId, sessionId, sessionKey, sql, crp).then((response) => {
    if (response.status === 'confirms') {
      sql.query('create table if not exists messages (id int primary key auto_increment, sender int not null, message varchar(255) not null, foreign key (sender) references users (id))')
      sql.query(`INSERT INTO messages(sender, message) VALUES(${userId}, '${message}')`)
      resolve({
        status: 'new_message',
        cause: 'Message has been added',
        message: 'Сообщение добавлено в БД',
      })
    }
  })
})

module.exports = sendMessageFunction
