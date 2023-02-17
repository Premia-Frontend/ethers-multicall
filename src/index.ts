import { ContractCall, encodeCallData } from './call';
import {
  getAddress,
  getAddressForChainId,
  multicallAddresses,
  Provider,
  setMulticallAddress,
} from './provider';

export {
  Provider,
  ContractCall,
  multicallAddresses,
  setMulticallAddress,
  getAddress,
  getAddressForChainId,
  encodeCallData,
};
export default {
  Provider,
  setMulticallAddress,
  multicallAddresses,
  getAddress,
  getAddressForChainId,
  encodeCallData,
};
