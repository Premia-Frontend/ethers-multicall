import { ethers } from 'ethers';
import { all, ContractCall, getMulticallContract } from './call';
import { Multicall } from './typechain';

export class Provider {
  private _provider: ethers.Provider;
  private _multicallAddress: string;
  private _multicallContract: Multicall;

  constructor(provider: ethers.Provider, chainId?: number) {
    this._provider = provider;

    if (!chainId) {
      this.init();
    } else {
      this._multicallAddress = getAddressForChainId(chainId);
      this._multicallContract = getMulticallContract(
        provider,
        this._multicallAddress,
      );
    }
  }

  public async init() {
    // Only required if `chainId` was not provided in constructor
    this._multicallAddress = await getAddress(this._provider);
    this._multicallContract = getMulticallContract(
      this._provider,
      this._multicallAddress,
    );
  }

  public getEthBalance(address: string) {
    if (!this._provider) {
      throw new Error('Provider should be initialized before use.');
    }
    return this._multicallContract.getEthBalance(address);
  }

  public async all<T extends any[] = any[]>(calls: ContractCall[]) {
    if (!this._provider) {
      throw new Error('Provider should be initialized before use.');
    }
    return all<T>(calls, this._multicallAddress, this._provider);
  }
}

export const multicallAddresses = {
  1: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
  3: '0xF24b01476a55d635118ca848fbc7Dab69d403be3',
  4: '0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821',
  5: '0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e',
  10: '0x43daF13717913a31462ca930E20A629bbaE6C8dd',
  42: '0x2cc8688c5f75e365aaeeb4ea8d6a480405a48d2a',
  56: '0x1Ee38d535d541c55C9dae27B12edf090C608E6Fb',
  69: '0x66465F74024a0CdbCB449CBcE882510561df3581',
  100: '0xb5b692a88bdfc81ca69dcb1d924f59f0413a602a',
  137: '0x11ce4B23bD875D7F5C6a31084f55fDe1e9A87507',
  250: '0x0118EF741097D0d3cc88e46233Da1e407d9ac139',
  42161: '0xab16069d3e9e352343b2040ce7d7715c585994f9',
  421613: '0x842eC2c7D803033Edf55E478F461FC547Bc54EB2',
  31337: '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441',
};

export function setMulticallAddress(chainId: number, address: string) {
  multicallAddresses[chainId] = address;
}

export function getAddressForChainId(chainId: number) {
  return multicallAddresses[chainId];
}

export async function getAddress(provider: ethers.Provider) {
  const { chainId } = await provider.getNetwork();
  return getAddressForChainId(Number(chainId));
}
