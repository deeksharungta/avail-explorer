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

export interface LatestTransactionsResponse {
  extrinsics: {
    nodes: {
      blockId: string;
      module: string;
      call: string;
      timestamp: string;
      txHash: string;
      success: boolean;
    }[];
  };
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

// Chain statistics types
export interface LatestBlockResponse {
  latestBlock: {
    nodes: {
      number: number;
      timestamp: string;
    }[];
  };
}

// Total Counts Type

export interface TotalTransactionCountsResponse {
  totalTransactions: {
    totalCount: number;
  };
}

export interface TotalBlobsCountsResponse {
  totalDataSubmissions: {
    totalCount: number;
  };
}

// Data Submission Stats Type
export interface DataSubmissionStatsResponse {
  dataSubmissionStats: {
    aggregates: {
      sum: {
        byteSize: number;
        fees: number;
        feesPerMb: number;
      };
      average: {
        byteSize: number;
        fees: number;
        feesPerMb: number;
      };
    };
  };
}

export interface DataSubmissionStats {
  totalByteSize: number;
  avgByteSize: number;
  totalFees: number;
  avgFees: number;
}
