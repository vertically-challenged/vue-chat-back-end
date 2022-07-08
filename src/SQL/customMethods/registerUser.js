/* eslint-disable no-shadow */
const registerUserFunction = (
  email,
  login,
  password,
  sql,
  crp,
) => new Promise((resolve) => {
  if (email === '' || login === '') {
    resolve({
      status: 'unregistered',
      cause: 'No login or email',
      message: 'Укажите логин и почту',
    })
    return
  }
  if (email.includes(' ') || login.includes(' ')) {
    resolve({
      status: 'unregistered',
      cause: 'Space in mail or login',
      message: 'Почта и логин не должны содержать пробелов',
    })
    return
  }
  if (password.length < 10 || password.length > 64) {
    resolve({
      status: 'unregistered',
      cause: 'Invalid password',
      message: 'Пароль должен быть от 10 до 64 символов',
    })
    return
  }
  sql.query('create table if not exists users(id int primary key auto_increment, email varchar(255) not null, login varchar(255) not null, password varchar(255) not null)')
  sql.query(`SELECT * FROM users WHERE email = '${email}' or login = '${login}'`, (err, results) => {
    if (err) console.log(err)
    if (results.length !== 0) {
      resolve({
        status: 'unregistered',
        cause: 'This username or email address is already taken',
        message: 'Такой логин или почта уже используются',
      })
      return
    }
    crp.hash(password).then((result) => {
      sql.query(`INSERT INTO users(email, login, password) VALUES('${email}', '${login}', '${result}')`)
    })
    resolve({
      status: 'registered',
      cause: 'Successful registration',
      message: 'Успешная регистрация',
    })
  })
})

module.exports = registerUserFunction
