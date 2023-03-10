import { Provider } from 'ethers';

import { ContractCall, Provider as MulticallProvider } from '../src';
import { IPool, IPool__factory } from './typechain';

async function batchCancelOrders(
  provider: Provider,
  poolAddresses: string[],
  orderHashes: string[][],
) {
  const multicallProvider = new MulticallProvider(
    provider,
    Number((await provider.getNetwork()).chainId),
  );

  const calls: ContractCall<IPool>[] = [];
  for (let i = 0; i < poolAddresses.length; i++) {
    const contract = IPool__factory.connect(poolAddresses[i]);

    for (const el of orderHashes[i]) {
      calls.push({
        contract,
        fragment: contract.interface.getFunction('cancelTradeQuotes'),
        callData: contract.interface.encodeFunctionData('cancelTradeQuotes', [
          [el],
        ]),
      });
    }
  }

  return multicallProvider.all(calls);
}
