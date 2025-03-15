import { gql } from 'graphql-request';

// Query to get the latest block
export const GET_LATEST_BLOCK = gql`
  query GetLatestBlock {
    latestBlock: blocks(first: 1, orderBy: NUMBER_DESC) {
      nodes {
        number
        timestamp
      }
    }
  }
`;

// Query to get total transaction counts
export const GET_TOTAL_TRANSACTION_COUNTS = gql`
  query GetTotalTransactionCounts {
    totalTransactions: extrinsics {
      totalCount
    }
  }
`;

// Query to get total blobs count
export const GET_TOTAL_BLOBS_COUNTS = gql`
  query GetTotalBlobsCounts {
    totalDataSubmissions: dataSubmissions {
      totalCount
    }
  }
`;

// Query to get data submission statistics
export const GET_DATA_SUBMISSION_STATS = gql`
  query GetDataSubmissionStats {
    dataSubmissionStats: dataSubmissions {
      aggregates {
        sum {
          byteSize
          fees
          feesPerMb
        }
        average {
          byteSize
          fees
          feesPerMb
        }
      }
    }
  }
`;
