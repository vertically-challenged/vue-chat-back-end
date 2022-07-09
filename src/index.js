/* eslint-disable array-callback-return */
const express = require('express')
const expressWS = require('express-ws')
const DBconfig = require('./DB-config.js')
const extendSQL = require('./SQL/SQL.js')
const sql = extendSQL((require('mysql').createConnection(DBconfig)))

const app = express()
const wss = expressWS(app)
// eslint-disable-next-line no-unused-vars
const aWss = wss.getWss()

let PORT = 8080
if (process.env.PORT) {
  PORT = Number(process.env.PORT)
}

app.ws('/', (ws) => {
  // eslint-disable-next-line no-param-reassign
  ws.dateID = Date.now()
  ws.on('message', (message) => {
    try {
      const messageObj = JSON.parse(message)
      switch (messageObj.type) {
        case 'registration':
          sql.registerUser(messageObj.email, messageObj.login, messageObj.password)
            .then((result) => {
              ws.send(JSON.stringify(result))
            })
          break
        case 'authorization':
          sql.authentication(messageObj.emailOrLogin, messageObj.password)
            .then((result) => {
              ws.send(JSON.stringify(result))
            })
          break
        case 'session_termination':
          sql.sessionTermination(
            Number(messageObj.userId),
            messageObj.sessionId,
            messageObj.sessionKey,
          )
          break
        case 'send_message':
          sql.sendMessage(
            Number(messageObj.userId),
            messageObj.sessionId,
            messageObj.sessionKey,
            messageObj.message,
          ).then((result) => {
            if (result.status === 'new_message') {
              aWss.clients?.forEach((client) => {
                if (messageObj.type === 'send_message') {
                  client.send(JSON.stringify({
                    status: result.status,
                    message: messageObj.message,
                    userId: messageObj.userId,
                  }))
                }
              })
            }
          })
          break
        case 'get_dialog_list':
          sql.getDialogList(
            Number(messageObj.userId),
            messageObj.sessionId,
            messageObj.sessionKey,
          ).then((result) => {
            ws.send(JSON.stringify(result))
          })
          break
      }
    } catch (error) {
      console.log('ERROR: Irrelevant data from the client \n ', error)
    }
  })
})

app.listen(PORT, () => {
  sql.connect((error) => {
    if (error) {
      console.log('ERROR:', error)
      return error
    }
    console.log('Successful database connection')
  })
  console.log(`Server started on PORT: ${PORT}`)
})
