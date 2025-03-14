import { AVAIL_INDEXER_ENDPOINT } from '@/lib/config/endpoints';
import { GraphQLClient } from 'graphql-request';

// Create a GraphQL client instance
const graphqlClient = new GraphQLClient(AVAIL_INDEXER_ENDPOINT);

export default graphqlClient;
