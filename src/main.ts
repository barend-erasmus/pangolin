import { HashProcessClient } from './hash-process-client';
import { RaftRPCClient } from './raft-rpc-client';
import { RPCClient } from './rpc-client';

const rpcClient: RPCClient = new RPCClient([], [], 'ws://localhost:8891');

const raftRPCClient: RaftRPCClient = new RaftRPCClient(rpcClient);

const hashProcessClient: HashProcessClient = new HashProcessClient(raftRPCClient, rpcClient);
