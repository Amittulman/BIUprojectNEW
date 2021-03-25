import knex from 'knex';
import {myCredentials} from "./credentialsnew";

class ConnectDataBase {
    private connection?: any;
    createConnection() {
        this.connection = knex({
            client: 'mysql',
            connection: {
                host: myCredentials.host,
                user: myCredentials.user,
                password: myCredentials.password,
                database: myCredentials.database
            }
        })
        return this.connection;
    }
}
export const connectDataBase = new ConnectDataBase();
