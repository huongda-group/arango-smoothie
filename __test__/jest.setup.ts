import { getArangoSmoothieInstances, ArangoSmoothie } from '../src';
import { connectionString } from './testData';

beforeEach(async () => {
  let options = {};
  if (process.env.OTTOMAN_LEGACY_TEST) {
    options = { collectionName: '_default' };
  }

  const ottoman = new ArangoSmoothie(options);
  await ottoman.connect(connectionString);
});

afterEach(async () => {
  for (const instance of getArangoSmoothieInstances()) {
    await instance.close();
  }
});
