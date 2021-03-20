import knex from 'knex';

const options = {
    client: 'mysql2',
    connection: {
        host: '127.0.0.1',
        user: 'user12',
        password: 's$cret',
        database: 'mydb'
    }
}

const knex = require('knex')(options);
