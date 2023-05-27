const { gql } = require('@apollo/server');
// Définir le schéma GraphQL
const typeDefs = `#graphql
    type fournisseur {
        id: String!
        title: String!
        description: String!
    }
    type boutique {
        id: String!
        title: String!
        description: String!
    }
    type Query {
        fournisseur(id: String!): fournisseur
        fournisseurs: [fournisseur]
        boutique(id: String!): boutique
        boutiques: [boutique]
    }
    type Mutation {
        createfournisseur(title: String!, description: String!): fournisseur
        createboutique(title: String!, description: String!): boutique
    
    }
`;
module.exports = typeDefs