export const parseError = (error: string) => {
  if (!error) return 'An unknown error occurred';

  // Convert to lowercase for case-insensitive matching
  const lowerError = error.toLowerCase();

  // Error code mapping for common blockchain/web3 error codes
  const errorCodeMap: Record<string, string> = {
    // Transaction errors
    '-32000': 'Transaction underpriced. Please increase gas price.',
    '-32001': 'Resource not found. Please check your connection.',
    '-32002': 'Resource unavailable. The network may be congested.',
    '-32003': 'Transaction rejected. Please try again.',
    '-32010': 'Transaction nonce is too low. Please try again.',
    '-32603': 'Internal JSON-RPC error. Please try again later.',
    '4001': 'Transaction rejected. The request was denied.',
    '4100': 'Unauthorized. The requested method is not available.',
    '4200': 'The requested method is not supported.',
    '4900': 'Disconnected from chain. Please reconnect your wallet.',
    '4901': 'Chain not connected. Please switch to the correct network.',
  };

  // Check if there's an error code in the message
  const codeMatch = error.match(/(-?\d+)/);
  if (codeMatch && errorCodeMap[codeMatch[0]]) {
    return errorCodeMap[codeMatch[0]];
  }

  // Common error patterns and their user-friendly alternatives (case-insensitive)
  if (
    lowerError.includes('insufficient balance') ||
    lowerError.includes('insufficient funds')
  ) {
    return 'Not enough funds to complete this transaction.';
  }
  if (lowerError.includes('gas') || lowerError.includes('fee')) {
    return 'Transaction fee estimation failed.';
  }
  if (lowerError.includes('nonce')) {
    return 'Transaction sequence error.';
  }
  if (lowerError.includes('timeout') || lowerError.includes('timed out')) {
    return 'Network is slow or unresponsive.';
  }
  if (
    lowerError.includes('user rejected') ||
    lowerError.includes('user denied') ||
    lowerError.includes('user cancelled') ||
    lowerError.includes('user canceled') ||
    lowerError.includes('rejected by user') ||
    lowerError.includes('denied by user')
  ) {
    return 'Transaction was rejected by the user.';
  }

  if (lowerError.includes('rejected') || lowerError.includes('denied')) {
    return 'Transaction was rejected by the network.';
  }
  if (
    lowerError.includes('unauthorized') ||
    lowerError.includes('not authorized')
  ) {
    return 'Authorization failed.';
  }
  if (lowerError.includes('rate limit') || lowerError.includes('too many')) {
    return 'Too many requests.';
  }
  if (
    lowerError.includes('network') ||
    lowerError.includes('connection') ||
    lowerError.includes('offline')
  ) {
    return 'Network connection issue.';
  }
  if (lowerError.includes('signature') || lowerError.includes('signing')) {
    return 'Signature verification failed.';
  }
  if (lowerError.includes('block') && lowerError.includes('not found')) {
    return 'Block not found. The network may be syncing.';
  }
  if (
    lowerError.includes('data') &&
    (lowerError.includes('invalid') || lowerError.includes('incorrect'))
  ) {
    return 'Invalid data format.';
  }

  // If no specific pattern matches, return a cleaner version of the original
  // Remove any hex data or excessive technical details
  let cleanedError = error.replace(/0x[a-fA-F0-9]+/g, '[address]');
  cleanedError = cleanedError.replace(/(\{|\[).*?(\}|\])/g, '');

  // Limit length and capitalize first letter
  return cleanedError.length > 100
    ? cleanedError.substring(0, 100) + '...'
    : cleanedError.charAt(0).toUpperCase() + cleanedError.slice(1);
};
