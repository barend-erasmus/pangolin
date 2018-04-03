import { HashProcessRCPClient } from './hash-process-rpc-client';
import { RaftRCPClient } from './raft-rpc-client';
import { RPCClient } from './rpc-client';

const rpcClient: RPCClient = new RPCClient([], [], 'ws://localhost:8891');

const raftRCPClient: RaftRCPClient = new RaftRCPClient(rpcClient);

const hashProcessRPCClient: HashProcessRCPClient = new HashProcessRCPClient(raftRCPClient, rpcClient);
