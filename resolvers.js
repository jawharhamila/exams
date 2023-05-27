const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Charger les fichiers proto pour les films et les séries TV
const fournisseurProtoPath = 'fournisseur.proto';
const boutiqueProtoPath = 'boutique.proto';

const fournisseurProtoDefinition = protoLoader.loadSync(fournisseurProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const boutiqueProtoDefinition = protoLoader.loadSync(boutiqueProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const fournisseurProto = grpc.loadPackageDefinition(fournisseurProtoDefinition).fournisseur;
const boutiqueProto = grpc.loadPackageDefinition(boutiqueProtoDefinition).boutique;

const clientfournisseurs = new fournisseurProto.fournisseurService('localhost:50051', grpc.credentials.createInsecure());
const clientboutiques = new boutiqueProto.boutiqueService('localhost:50052', grpc.credentials.createInsecure());

// Définir les résolveurs pour les requêtes GraphQL
const resolvers = {
    Query: {
        fournisseur: (_, { id }) => {
            // Effectuer un appel gRPC au microservice de films
            const client = new fournisseurProto.fournisseurService('localhost:50051',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.getfournisseur({ fournisseur_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.fournisseur);
                    }
                });
            });
        },
        fournisseurs: () => {
            // Effectuer un appel gRPC au microservice de films
            const client = new fournisseurProto.fournisseurService('localhost:50051',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchfournisseurs({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.fournisseurs);
                    }
                });
            });
        },

        boutique: (_, { id }) => {
            // Effectuer un appel gRPC au microservice de séries TV
            const client = new boutiqueProto.boutiqueService('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.getboutique({ tv_show_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.tv_show);
                    }
                });
            });
        },

        boutiques: () => {
            // Effectuer un appel gRPC au microservice de séries TV
            const client = new boutiqueProto.boutiqueService('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchboutiques({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.tv_shows);
                    }
                });
            });
        },
    },
    Mutation: {
        createboutique: (_, { id, title, description }) => {
            return new Promise((resolve, reject) => {
                clientboutiques.createboutique({ tv_show_id: id, title: title, description: description }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.tv_show);
                    }
                });
            });
        },
    }
};

module.exports = resolvers;