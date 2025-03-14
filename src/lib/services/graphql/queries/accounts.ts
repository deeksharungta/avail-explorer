import { gql } from 'graphql-request';

// Get account details
export const GET_ACCOUNT_BY_ID = gql`
  query GetAccountById($id: String!) {
    accountEntity(id: $id) {
      id
      validator
      amount
      amountFrozen
      amountTotal
      amountRounded
      amountFrozenRounded
      amountTotalRounded
      createdAt
      updatedAt
    }
  }
`;

// Get transfers for an account
export const GET_ACCOUNT_TRANSFERS = gql`
  query GetAccountTransfers($address: String!, $first: Int!, $after: Cursor) {
    fromTransfers: transferEntities(
      filter: { from: { equalTo: $address } }
      first: $first
      after: $after
      orderBy: TIMESTAMP_DESC
    ) {
      nodes {
        id
        blockId
        extrinsicId
        timestamp
        from
        to
        amount
        amountRounded
        currency
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
    toTransfers: transferEntities(
      filter: { to: { equalTo: $address } }
      first: $first
      after: $after
      orderBy: TIMESTAMP_DESC
    ) {
      nodes {
        id
        blockId
        extrinsicId
        timestamp
        from
        to
        amount
        amountRounded
        currency
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// Get transactions for an account
export const GET_ACCOUNT_TRANSACTIONS = gql`
  query GetAccountTransactions(
    $address: String!
    $first: Int!
    $after: Cursor
  ) {
    extrinsics(
      filter: { signer: { equalTo: $address } }
      first: $first
      after: $after
      orderBy: TIMESTAMP_DESC
    ) {
      nodes {
        id
        module
        call
        timestamp
        blockHeight
        success
        hash
        feesRounded
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;
