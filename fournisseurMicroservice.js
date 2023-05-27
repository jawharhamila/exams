const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mysql = require('mysql2');

const fournisseurProtoPath = 'fournisseur.proto';

const fournisseurProtoDefinition = protoLoader.loadSync(fournisseurProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const fournisseurProto = grpc.loadPackageDefinition(fournisseurProtoDefinition).fournisseur;

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'jawhar',
});

const fournisseurService = {
    getfournisseur: (call, callback) => {
        const { fournisseur_id } = call.request;
        const query = 'SELECT * FROM fournisseur WHERE id = ?';
        const values = [fournisseur_id];

        pool.query(query, values, (error, results) => {
            if (error) {
                callback(error);
            } else {
                const fournisseur = results[0];
                callback(null, { fournisseur });
            }
        });
    },
    searchfournisseur: (call, callback) => {
        const { query } = call.request;
        const searchQuery = 'SELECT * FROM fournisseur WHERE title LIKE ?';
        const values = [`%${query}%`];

        pool.query(searchQuery, values, (error, results) => {
            if (error) {
                callback(error);
            } else {
                const fournisseur = results;
                callback(null, { fournisseur });
            }
        });
    },
    createfournisseur: (call, callback) => {
        const { title, description } = call.request;
        const query = 'INSERT INTO fournisseur (title, description) VALUES (?, ?)';
        const values = [title, description];

        pool.query(query, values, (error, results) => {
            if (error) {
                callback(error);
            } else {
                const insertedId = results.insertId;
                const fournisseur = { id: insertedId, title, description };
                callback(null, { fournisseur });
            }
        });
    },
};

const server = new grpc.Server();
server.addService(fournisseurProto.fournisseurService.service, fournisseurService);
const port = 50051;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Failed to bind the server:', err);
        return;
    }
    console.log(`The server is running on port ${port}`);
    server.start();
});

console.log(`fournisseur microservice is running on port ${port}`);
