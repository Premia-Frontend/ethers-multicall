import { ethers, FunctionFragment, Provider } from 'ethers';
import { Multicall, Multicall__factory } from './typechain';

// TODO: Figure out a more elegant way to get callData and fragment from a contract call

export interface ContractLike {
  address: string;
  interface: {
    encodeFunctionData(
      fragment: FunctionFragment | string,
      args: any[],
    ): string;
  };
  getFunction(name: string): FunctionFragment;
}

export interface ContractCall<T extends ContractLike = ContractLike> {
  contract: T;
  fragment: FunctionFragment | string;
  callData: string;
}

export function encodeCallData<T extends ContractLike = ContractLike>(
  contract: T,
  fragment: FunctionFragment | string,
  args: any[],
): string {
  return contract.interface.encodeFunctionData(fragment, args);
}

export async function all<T extends any[] = any[]>(
  calls: ContractCall[],
  multicallAddress: string,
  provider: Provider,
): Promise<T> {
  const multicall = getMulticallContract(provider, multicallAddress);
  const response: {
    blockNumber: bigint;
    returnData: string[];
  } = await multicall.aggregate(
    calls.map(call => ({
      target: call.contract.address,
      callData: call.callData,
    })),
  );

  const callResult = [] as T;
  for (let i = 0; i < calls.length; i++) {
    const fragment: FunctionFragment =
      typeof calls[i].fragment === 'string'
        ? calls[i].contract.getFunction(calls[i].fragment as string)
        : (calls[i].fragment as FunctionFragment);

    const returnData = response.returnData[i];
    const params = decodeCall(fragment.outputs, returnData);
    const result = fragment.outputs.length === 1 ? params[0] : params;

    callResult.push(result);
  }

  return callResult;
}

export function decodeCall(
  outputs: readonly ethers.ParamType[],
  data: ethers.BytesLike,
) {
  const abiCoder = new ethers.AbiCoder();
  const params = abiCoder.decode(outputs, data);
  return params;
}

export function getMulticallContract(
  provider: Provider,
  multicallAddress: string,
): Multicall {
  return Multicall__factory.connect(multicallAddress, provider);
}
