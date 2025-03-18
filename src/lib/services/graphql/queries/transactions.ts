import { gql } from 'graphql-request';

// Get the latest transactions with pagination
export const GET_LATEST_TRANSACTIONS = gql`
  query GetLatestTransactions($first: Int!, $after: Cursor) {
    extrinsics(
      first: $first
      after: $after
      orderBy: TIMESTAMP_DESC
      filter: {
        # Filter out timestamp.set transactions
        or: [
          {
            # Include specific interesting modules
            module: {
              in: [
                "balances"
                "staking"
                "identity"
                "assets"
                "contracts"
                "utility"
                "multisig"
                "proxy"
                "council"
                "democracy"
                "treasury"
                "elections"
                "dataAvailability"
              ]
            }
          }
          {
            # Include interesting system calls
            and: [
              { module: { equalTo: "system" } }
              { call: { in: ["remark", "setCode"] } }
            ]
          }
        ]
        # Exclude timestamp module entirely
        module: { notEqualTo: "timestamp" }
      }
    ) {
      nodes {
        blockId
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

// Get multiple transactions by hashes with detailed information
export const GET_TRANSACTIONS_BY_HASHES = gql`
  query GetTransactionsByHashes($hashes: [String!]!) {
    extrinsics(filter: { hash: { in: $hashes } }) {
      nodes {
        txHash
        success
        timestamp
        argsValue
        module
        call
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
