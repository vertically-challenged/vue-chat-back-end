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
const sessionsStor = {
  stor: {},
  save(ws, userId) {
    if (!this.stor[userId]) {
      this.stor[userId] = []
    }
    this.stor[userId].push(ws)
  },
}

let PORT = 8080
if (process.env.PORT) {
  PORT = Number(process.env.PORT)
}

app.ws('/', (ws) => {
  let sessionNotAdded = true
  let sessionUserId = null
  // eslint-disable-next-line no-param-reassign
  ws.dateID = Date.now()
  ws.on('message', (message) => {
    try {
      const messageObj = JSON.parse(message)
      if (messageObj.userId && sessionNotAdded) {
        sessionsStor.save(ws, messageObj.userId)
        sessionNotAdded = false
        sessionUserId = messageObj.userId
      }

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
              sessionsStor.save(ws, result.userId)
              sessionNotAdded = false
              sessionUserId = result.userId
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
            messageObj.addressee,
            messageObj.message,
          ).then((result) => {
            sessionsStor.stor[result.recipient]?.forEach((recipientWS) => {
              recipientWS.send(JSON.stringify(result))
            })
          })
          break
        case 'get_dialog_list':
          sql.getDialogList(
            Number(messageObj.userId),
            messageObj.sessionId,
            messageObj.sessionKey,
          ).then((result) => {
            console.log(result)

            ws.send(JSON.stringify(result))
          })
          break
      }

      // // eslint-disable-next-line no-unused-vars
      // aWss.clients?.forEach((client )  => {
      //   // client.send(messageObj.text?.toString())
      // })
    } catch (error) {
      console.log('ERROR: Irrelevant data from the client \n ', error)
    }
    // console.log(sessionsStor.stor)
  })
  ws.on('close', () => {
    sessionsStor.stor[sessionUserId] = sessionsStor.stor[sessionUserId]?.map((session) => {
      if (session.dateID !== ws.dateID) return session
    }).filter((element) => element !== undefined)
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
