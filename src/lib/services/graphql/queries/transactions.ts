import { gql } from 'graphql-request';

// Get the latest transactions with pagination
export const GET_LATEST_TRANSACTIONS = gql`
  query GetLatestTransactions($first: Int!, $after: Cursor) {
    extrinsics(first: $first, after: $after, orderBy: TIMESTAMP_DESC) {
      nodes {
        id
        module
        call
        timestamp
        txHash
        blockHeight
        success
        extrinsicIndex
        hash
        signature
        signer
        feesRounded
        argsName
        argsValue
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

// Get a single transaction by hash with detailed information
export const GET_TRANSACTION_BY_HASH = gql`
  query GetTransactionByHash($hash: String!) {
    extrinsics(filter: { hash: { equalTo: $hash } }) {
      nodes {
        id
        blockId
        txHash
        module
        call
        blockHeight
        success
        isSigned
        extrinsicIndex
        hash
        timestamp
        signer
        signature
        fees
        feesRounded
        nonce
        argsName
        argsValue
        nbEvents
        block {
          number
          timestamp
          hash
        }
        events: events {
          nodes {
            id
            module
            event
            blockHeight
            eventIndex
            argsName
            argsValue
            timestamp
          }
        }
      }
    }
  }
`;

// Get transaction statistics
export const GET_TRANSACTION_STATS = gql`
  query GetTransactionStats {
    extrinsics(first: 100, orderBy: TIMESTAMP_DESC) {
      aggregates {
        sum {
          feesRounded
        }
        average {
          feesRounded
        }
      }
    }
  }
`;
