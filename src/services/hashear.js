// hashear.js
const bcrypt = require('bcrypt');

const run = async () => {
  const plainPassword = '1234';
  const hashed = await bcrypt.hash(plainPassword, 10);
  console.log('Hash:', hashed);
};

run();
