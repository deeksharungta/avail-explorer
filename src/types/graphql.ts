// Common types used across multiple domains
export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
  hasPreviousPage?: boolean;
  startCursor?: string | null;
}

export interface NodeConnection<T> {
  nodes: T[];
  pageInfo: PageInfo;
  totalCount: number;
}

// Block related types
export interface Block {
  id: string;
  number: number;
  hash: string;
  timestamp: string;
  parentHash: string;
  stateRoot: string;
  extrinsicsRoot: string;
  author: string | null;
  runtimeVersion: number;
  nbExtrinsics: number;
  nbEvents: number;
  sessionId: number | null;
}

// Transaction (Extrinsic) related types
export interface Extrinsic {
  id: string;
  blockId?: string;
  module: string;
  call: string;
  timestamp: string;
  txHash: string;
  blockHeight: number;
  success: boolean;
  isSigned: boolean;
  extrinsicIndex: number;
  hash: string;
  signature: string;
  signer: string;
  feesRounded: number | null;
  nonce: number;
  nbEvents: number;
  argsName: Record<string, unknown>;
  argsValue: Record<string, unknown>;
  block: {
    id: string;
    number: number;
    timestamp: string;
  };
}

// Event related types
export interface EventNode {
  id: string;
  blockId: string;
  module: string;
  event: string;
  eventIndex: number;
  call: string;
  argsName: Record<string, unknown>;
  argsValue: Record<string, unknown>;
  blockHeight: number;
  timestamp: string;
}

// Transfer related types
export interface TransferEntityNode {
  id: string;
  blockId: string;
  blockHash: string;
  from: string;
  to: string;
  currency: string;
  amount: string;
  amountRounded: number;
  timestamp: string;
  extrinsicId?: string;
}

// Data submission related types
export interface DataSubmissionNode {
  id: string;
  timestamp: string;
  byteSize: number;
  appId: number;
  signer: string;
  fees: number;
  feesPerMb: number;
  extrinsicId?: string;
}

// Block extension types
export interface HeaderExtensionNode {
  id: string;
  version: string;
  commitments: {
    nodes: CommitmentNode[];
  };
}

export interface CommitmentNode {
  id: string;
  rows: number;
  cols: number;
  dataRoot: string;
  commitment: string;
}

export interface LogNode {
  id: string;
  type: string;
  engine: string;
  data: string;
}

// Response for related data
export interface ExtrinsicRelatedDataResponse {
  events: {
    nodes: EventNode[];
  };
  transferEntities: {
    nodes: TransferEntityNode[];
  };
  dataSubmissions: {
    nodes: DataSubmissionNode[];
  };
}

// Extended extrinsic with relations
export interface ExtrinsicWithRelations extends Extrinsic {
  block: {
    id: string;
    number: number;
    timestamp: string;
    hash: string;
    parentHash: string;
    stateRoot: string;
    extrinsicsRoot: string;
    runtimeVersion: number;
    nbExtrinsics: number;
    nbEvents: number;
    author: string;
    sessionId: number;
    headerExtensions: {
      nodes: HeaderExtensionNode[];
    };
    logs: {
      nodes: LogNode[];
    };
  };
  relatedData?: {
    events: EventNode[];
    transfers: TransferEntityNode[];
    dataSubmissions: DataSubmissionNode[];
  };
}

export interface ExtrinsicsResponse {
  extrinsics: NodeConnection<Extrinsic>;
}

export interface ExtrinsicResponse {
  extrinsics: {
    nodes: ExtrinsicWithRelations[];
  };
}

export interface ExtrinsicAggregates {
  sum: {
    feesRounded: number;
  };
  average: {
    feesRounded: number;
  };
}

export interface ExtrinsicStatsResponse {
  extrinsics: {
    aggregates: ExtrinsicAggregates;
  };
}

// Account related types
export interface Account {
  id: string;
  validator: boolean;
  validatorSessionParticipated: number;
  amount: string;
  amountFrozen: string;
  amountTotal: string;
  amountRounded: number;
  amountFrozenRounded: number;
  amountTotalRounded: number;
  createdAt: string;
  updatedAt: string;
  timestampCreation: string;
}

export interface AccountResponse {
  accountEntity: Account | null;
}

export interface Transfer {
  id: string;
  blockId: string;
  blockHash: string;
  extrinsicId: string;
  timestamp: string;
  from: string;
  to: string;
  currency: string;
  amount: string;
  amountRounded: number;
}

export interface AccountTransfersResponse {
  fromTransfers: NodeConnection<Transfer>;
  toTransfers: NodeConnection<Transfer>;
}

export interface TransformedAccountTransfers {
  sent: NodeConnection<Transfer>;
  received: NodeConnection<Transfer>;
}

export interface AccountTransactionsResponse {
  extrinsics: NodeConnection<Extrinsic>;
}

// Chain statistics types
export interface ChainStatsResponse {
  latestBlock: {
    nodes: Block[];
  };
  totalBlocks: {
    totalCount: number;
  };
  totalTransactions: {
    totalCount: number;
  };
  totalDataSubmissions: {
    totalCount: number;
  };
  recentBlocks: {
    nodes: Block[];
  };
  recentTransactions: {
    nodes: Extrinsic[];
  };
  dataSubmissionStats: {
    aggregates: {
      sum: {
        byteSize: number;
      };
    };
  };
}

export interface GroupedAggregate {
  keys: string[];
  count: number;
}

export interface DataSizeGroupedAggregate {
  keys: string[];
  sum: {
    byteSize: number;
  };
}

export interface TransactionVolumeResponse {
  extrinsics: {
    groupedAggregates: GroupedAggregate[];
  };
}

export interface DataSubmissionVolumeResponse {
  dataSubmissions: {
    groupedAggregates: DataSizeGroupedAggregate[];
  };
}

export interface VolumeDataPoint {
  date: string;
  count: number;
}

export interface DataSizeVolumeDataPoint {
  date: string;
  size: number;
}
