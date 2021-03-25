import knex from 'knex';
import {myCredentials} from "./credentialsnew";

class ConnectDataBase {
    private connection?: any; // TOSO:knex
    createConnection() {
        this.connection = knex({
            client: 'mysql',
            connection: {
                host: myCredentials.host,
                user: myCredentials.user,
                password: myCredentials.pass,
                database: 'BeeZee' //TODO: what is the name
            }
        })
        return this.connection;
    }
}

export const connectDataBase = new ConnectDataBase();
