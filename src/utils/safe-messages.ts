import { hashMessage, isAddress, _TypedDataEncoder } from 'ethers/lib/utils'

import { GOERLI_TX_SERVICE_STAGING_URL } from '@/config/constants'
import { hashTypedData } from '@/utils/web3'
import type { EIP712TypedData } from '@/utils/web3'

/**
 * Generates `SafeMessage` typed data for signing
 * https://github.com/safe-global/safe-contracts/blob/main/contracts/handler/CompatibilityFallbackHandler.sol#L12
 */
export const generateSafeMessage = (
  chainId: number,
  safeAddress: string,
  message: string | EIP712TypedData,
): EIP712TypedData | undefined => {
  if (!isAddress(safeAddress) || !message) {
    return
  }

  return {
    domain: {
      chainId: chainId,
      verifyingContract: safeAddress,
    },
    types: {
      SafeMessage: [{ name: 'message', type: 'bytes' }],
    },
    message: {
      message: typeof message === 'string' ? hashMessage(message) : hashTypedData(message),
    },
  }
}

enum SignatureType {
  CONTRACT_SIGNATURE = 'CONTRACT_SIGNATURE',
  APPROVED_HASH = 'APPROVED_HASH',
  EOA = 'EOA',
  ETH_SIGN = 'ETH_SIGN',
}

export type TransactionServiceSafeMessage = {
  created: string
  modified: string
  messageHash: string
  message: string | EIP712TypedData
  proposedBy: string
  safeAppId: number | null
  confirmations: {
    created: string
    modified: string
    owner: string
    signature: string
    signatureType: SignatureType
  }[]
  preparedSignature: string
}

export const fetchSafeMessage = async (safeMessageHash: string): Promise<TransactionServiceSafeMessage | undefined> => {
  let safeMessage: TransactionServiceSafeMessage | undefined

  try {
    safeMessage = await fetch(`${GOERLI_TX_SERVICE_STAGING_URL}/v1/messages/${safeMessageHash}/`, {
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => {
      if (!res.ok) {
        return Promise.reject('Invalid response when fetching SafeMessage')
      }
      return res.json() as Promise<TransactionServiceSafeMessage>
    })
  } catch {
    // Ignore
  }

  return safeMessage
}
