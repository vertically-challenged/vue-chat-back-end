const cryptograph = require('crypto')

const hashLength = 32

const crp = {
  async hash(str, salt) {
    return new Promise((resolve, reject) => {
      const saltInUse = salt || cryptograph.randomBytes(16).toString('hex')
      cryptograph.scrypt(str, saltInUse, hashLength, (err, derivedKey) => {
        if (err) reject(err)
        resolve(`${derivedKey.toString('hex')}:${saltInUse}`)
      })
    })
  },
  async getSessionKey() {
    const sessionKey = await cryptograph.randomBytes(16).toString('hex')
    return sessionKey
  },
}

module.exports = crp
