import * as Configuration from "arangojs/configuration";
import * as Collections from "arangojs/collections";
import { Database } from "arangojs";

export interface ConnectOptions extends Configuration.ConfigOptions {
  logging?: boolean;
  autoCreateConnect?: boolean;
}

interface EnsureIndexesOptions {
  ignoreWatchIndexes?: boolean;
}

export default class ArangoSmoothie {
  private database: Database = new Database();
  private logging: boolean = true;
  private collections: Collections.CollectionDescription[] = [];
  private options: ConnectOptions = {};
  private models = {};

  constructor(connectOptions: ConnectOptions) {
    this.logging = 'logging' in connectOptions ? !!connectOptions.logging : true;
    this.database = new Database(connectOptions);
    this.options = connectOptions;

    return this;
  }

  /**
   * Connect to Arango server.
   * @example
   * ```javascript
   *  import { connect } from "arango-smoothie";
   *  await ArangoSmoothie.connect({
   *     url: "http://127.0.0.1:8529/",
   *     databaseName: "dev_lib",
   *     auth: { username: "dev_libs", password: "dev_lib" },
   *   });
   * ```
   */
  connect = async (): Promise<ArangoSmoothie> => {
    this.collections = await this.database.listCollections();
    return this;
  };

  model = async (name: string, schema: object, options?: EnsureIndexesOptions): Promise<ArangoSmoothie> => {
    this.models[name] = this.database.collection(name);
    if (this.options.autoCreateConnect &&  !await this.models[name].exists()) {
      await this.database.collection(name)
    }

    return this;
  };
}
