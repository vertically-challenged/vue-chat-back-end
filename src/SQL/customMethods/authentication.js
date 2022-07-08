const authenticationFunction = (
  emailOrLogin,
  password,
  sql,
  crp,
) => new Promise((resolve) => {
  if (emailOrLogin === '' && password === '') {
    resolve({
      status: 'unauthorized',
      cause: 'No login or password',
      message: 'Укажите данные для входа',
    })
    return
  }
  const searchField = (emailOrLogin.includes('@')) ? 'email' : 'login'
  sql.query(`SELECT * FROM users WHERE ${searchField} = '${emailOrLogin}'`, async (err, results) => {
    if (err) console.log(err)
    if (results.length === 0) {
      resolve({
        status: 'unauthorized',
        cause: 'Invalid data',
        message: 'Пользователь с такой почтой или логином не зарегистрирован',
      })
      return
    }
    const [, salt] = results[0].password.split(':')
    const generatedPassword = await crp.hash(password, salt)
    if (generatedPassword === results[0].password) {
      sql.query('create table if not exists sessions (id varchar(255) primary key, user_id int not null, session_key varchar(255) not null, foreign key (user_id) references users (id))')
      const sessionKey = await crp.getSessionKey()
      const sessionKeyHash = await crp.hash(sessionKey)
      const sessionId = `${Date.now().toString(16)}:${results[0].id}`
      sql.query(`INSERT INTO sessions(id, user_id, session_key) VALUES('${sessionId}', '${results[0].id}','${sessionKeyHash}')`)
      resolve({
        status: 'authorized',
        cause: 'Successful authorization',
        message: 'Успешная авторизация',
        userId: results[0].id,
        sessionId,
        sessionKey,
      })
      return
    }
    resolve({
      status: 'unauthorized',
      cause: 'Invalid data',
      message: 'Неверный логин или пароль',
    })
  })
})

module.exports = authenticationFunction
