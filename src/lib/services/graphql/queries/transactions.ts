import { gql } from 'graphql-request';

// Get the latest transactions with pagination
export const GET_LATEST_TRANSACTIONS = gql`
  query GetLatestTransactions($first: Int!, $after: Cursor) {
    extrinsics(first: $first, after: $after, orderBy: TIMESTAMP_DESC) {
      nodes {
        module
        call
        timestamp
        txHash
        success
      }
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
        timestamp
        signer
        signature
        feesRounded
        nonce
        nbEvents
        block {
          id
          number
          timestamp
        }
      }
    }
  }
`;

// Get related data using the extrinsic ID retrieved from the first query
export const GET_TRANSACTION_RELATED_DATA = gql`
  query GetTransactionRelatedData($extrinsicId: String!) {
    events(
      filter: { extrinsicId: { equalTo: $extrinsicId } }
      orderBy: EVENT_INDEX_ASC
    ) {
      nodes {
        id
        blockId
        module
        event
        eventIndex
        call
        argsName
        argsValue
        blockHeight
        timestamp
      }
    }

    # Get transfer data if this extrinsic involves a transfer
    transferEntities(filter: { extrinsicId: { equalTo: $extrinsicId } }) {
      nodes {
        id
        blockId
        blockHash
        from
        to
        currency
        amount
        amountRounded
        timestamp
      }
    }

    # Get data submissions if this is a data submission extrinsic
    dataSubmissions(filter: { extrinsicId: { equalTo: $extrinsicId } }) {
      nodes {
        id
        timestamp
        byteSize
        appId
        signer
        fees
        feesPerMb
      }
    }
  }
`;
