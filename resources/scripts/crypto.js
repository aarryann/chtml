const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);

const encrypt = (text, secretKey) => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    mims: encrypted.toString('hex'),
    mams: iv.toString('hex')
  };
};

const decrypt = (hash, secretKey) => {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.mams, 'hex'));

  const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.mims, 'hex')), decipher.final()]);

  return decrpyted.toString();
};

module.exports = {
  encrypt,
  decrypt
};