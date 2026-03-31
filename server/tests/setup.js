import { beforeAll, afterEach, afterAll } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongod

export const setupDB = () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    await mongoose.connect(mongod.getUri())
  })

  afterEach(async () => {
    // Clean all collections between tests
    const collections = mongoose.connection.collections
    for (const key in collections) {
      await collections[key].deleteMany()
    }
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongod.stop()
  })
}
