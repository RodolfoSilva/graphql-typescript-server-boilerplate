const { default: MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer({ autoStart: false });

const globalSetup = async () => {
  await mongod.start();

  process.env.MONGO_URI = await mongod.getConnectionString();

  global.__MONGOD__ = mongod;
};

module.exports = globalSetup;
