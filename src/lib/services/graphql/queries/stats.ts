import { gql } from 'graphql-request';

// Get overall chain statistics
export const GET_CHAIN_STATS = gql`
  query GetChainStats {
    latestBlock: blocks(first: 1, orderBy: NUMBER_DESC) {
      nodes {
        number
        timestamp
      }
    }
    totalBlocks: blocks {
      totalCount
    }
    totalTransactions: extrinsics {
      totalCount
    }
    totalDataSubmissions: dataSubmissions {
      totalCount
    }
    recentBlocks: blocks(first: 20, orderBy: NUMBER_DESC) {
      nodes {
        number
        timestamp
        nbExtrinsics
      }
    }
    recentTransactions: extrinsics(first: 20, orderBy: TIMESTAMP_DESC) {
      nodes {
        module
        call
        success
      }
    }
    dataSubmissionStats: dataSubmissions {
      aggregates {
        sum {
          byteSize
        }
      }
    }
  }
`;

// Get transaction volume over time
export const GET_TRANSACTION_VOLUME = gql`
  query GetTransactionVolume($timeframe: Int!) {
    extrinsics(
      filter: {
        timestamp: { greaterThan: "NOW() - INTERVAL '$timeframe DAYS'" }
      }
    ) {
      groupedAggregates(groupBy: [TIMESTAMP_TRUNCATED_TO_DAY]) {
        keys
        count
      }
    }
  }
`;

// Get data submission volume over time
export const GET_DATA_SUBMISSION_VOLUME = gql`
  query GetDataSubmissionVolume($timeframe: Int!) {
    dataSubmissions(
      filter: {
        timestamp: { greaterThan: "NOW() - INTERVAL '$timeframe DAYS'" }
      }
    ) {
      groupedAggregates(groupBy: [TIMESTAMP_TRUNCATED_TO_DAY]) {
        keys
        sum {
          byteSize
        }
      }
    }
  }
`;
