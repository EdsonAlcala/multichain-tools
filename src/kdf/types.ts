export type SLIP044ChainId = 0 | 60 | 118

export interface KeyDerivationPath {
  chain: SLIP044ChainId
  domain?: string
  meta?: Record<string, any>
}
