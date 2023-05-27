const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mysql = require('mysql2');

const boutiqueProtoPath = 'boutique.proto';
const boutiqueProtoDefinition = protoLoader.loadSync(boutiqueProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const boutiqueProto = grpc.loadPackageDefinition(boutiqueProtoDefinition).boutique;

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'jawhar',
});

const boutiqueservice = {
    getboutique: (call, callback) => {
        const { boutique_id } = call.request;
        const query = 'SELECT * FROM boutique WHERE id = ?';
        const values = [boutique_id];

        pool.query(query, values, (error, results) => {
            if (error) {
                callback(error);
            } else {
                const boutique = results[0];
                callback(null, { boutique });
            }
        });
    },
    getboutiques: (call, callback) => {
        const searchQuery = 'SELECT * FROM boutique';

        pool.query(searchQuery, values, (error, results) => {
            if (error) {
                callback(error);
            } else {
                const boutiques = results;
                callback(null, { boutiques });
            }
        });
    },
    searchboutiques: (call, callback) => {
        const { query } = call.request;
        const searchQuery = 'SELECT * FROM boutique WHERE title LIKE ?';
        const values = [`%${query}%`];

        pool.query(searchQuery, values, (error, results) => {
            if (error) {
                callback(error);
            } else {
                const boutiques = results;
                callback(null, { boutiques });
            }
        });
    },
    createboutique: (call, callback) => {
        const { title, description } = call.request;
        const query = 'INSERT INTO boutique (title, description) VALUES (?, ?)';
        const values = [title, description];

        pool.query(query, values, (error, results) => {
            if (error) {
                callback(error);
            } else {
                const insertedId = results.insertId;
                const boutique = { id: insertedId, title, description };
                callback(null, { boutique });
            }
        });
    },
};

const server = new grpc.Server();
server.addService(boutiqueProto.boutiqueService.service, boutiqueservice);
const port = 50052;
const ipAddress = '127.0.0.1'; // Utilisez votre adresse IP spécifique si nécessaire
server.bindAsync(`${ipAddress}:${port}`, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
    if (err) {
        console.error('Failed to bind the server:', err);
        return;
    }
    console.log(`The server is running on port ${boundPort}`);
    server.start();
});

console.log(`boutique microservice is running on port ${port}`);

