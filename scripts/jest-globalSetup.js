const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const mongod = new MongoMemoryServer({ autoStart: false });

const globalSetup = async () => {
  await mongod.start();

  process.env.MONGO_URI = await mongod.getConnectionString();

  await mongoose.connect(
    process.env.MONGO_URI,
    { useNewUrlParser: true }
  );

  global.__MONGOD__ = mongod;
};

module.exports = globalSetup;
