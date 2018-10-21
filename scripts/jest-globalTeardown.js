const mongoose = require('mongoose');

const globalTearDown = async () => {
  await mongoose.connection.close();
  await global.__MONGOD__.stop();
};

module.exports = globalTearDown;
