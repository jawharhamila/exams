const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Charger les fichiers proto pour les films et les séries TV
const fournisseurProtoPath = 'fournisseur.proto';
const boutiqueProtoPath = 'boutique.proto';
const resolvers = require('./resolvers');
const typeDefs = require('./schema');

// Créer une nouvelle application Express
const app = express();
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
const clientfournisseur = new fournisseurProto.fournisseurService('localhost:50051', grpc.credentials.createInsecure());
const clientboutiques = new boutiqueProto.boutiqueService('localhost:50052', grpc.credentials.createInsecure());

// Créer une instance ApolloServer avec le schéma et les résolveurs importés
const server = new ApolloServer({ typeDefs, resolvers });

// Appliquer le middleware ApolloServer à l'application Express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
server.start().then(() => {
    app.use(
        cors(),
        expressMiddleware(server),
    );
});

app.get('/fournisseur', (req, res) => {
    const client = new fournisseurProto.fournisseurService('localhost:50051',
        grpc.credentials.createInsecure());
    const { q } = req.query;
    client.searchfournisseur({ query: q }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.fournisseur);
        }
    });
});

app.post('/fournisseur', (req, res) => {
    const { title, description } = req.body;
    clientfournisseur.createfournisseur({ title: title, description: description }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.fournisseur);
        }
    });
});

app.get('/fournisseur/:id', (req, res) => {
    const client = new fournisseurProto.fournisseurService('localhost:50051',
        grpc.credentials.createInsecure());
    const id = req.params.id;
    client.getfournisseur({ fournisseur_id: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.fournisseur);
        }
    });
});

app.get('/boutiques', (req, res) => {
    const client = new boutiqueProto.boutiqueService('localhost:50052',
        grpc.credentials.createInsecure());
    const { q } = req.query;
    client.searchboutiques({ query: q }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.boutiques);
        }
    });
});

app.post('/boutique', (req, res) => {
    const { title, description } = req.body;
    clientboutiques.createboutique({ title: title, description: description }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.boutique);
        }
    });
});

app.get('/boutiques/:id', (req, res) => {
    const client = new boutiqueProto.boutiqueService('localhost:50052',
        grpc.credentials.createInsecure());
    const id = req.params.id;
    client.getboutique({ boutique_id: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.boutique);
        }
    });
});

// Démarrer l'application Express
const port = 3000;
app.listen(port, () => {
    console.log(`API Gateway en cours d'exécution sur le port ${port}`);
});