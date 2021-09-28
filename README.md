# NFT Auction Subgraph
This subgraph tracks Auction contract activity of users, NFTs and listings.

## Deployment (Goerli testnet)
* Explorer and playground: https://thegraph.com/legacy-explorer/subgraph/jackqack/auction-goerli  
* GraphQL API url: https://api.thegraph.com/subgraphs/name/jackqack/auction-goerli  


## Deploy
1. Install deps with `yarn install`.  
2. Generate types for GraphQL schema with `graph codegen`.  
3. Run `graph build` to build subgraph.  
4. Deploy subgraph to Goerli testnet with `yarn deploy-testnet`.  


## Deployed contracts (Goerli testnet)

Smart contracts are deployed and verified on Goerli testnet.

| Conract  | Address                                     |
| -------- | ------------------------------------------- |
| Token    | [0x3baD5566ca28Bc698E9d7F26117Ae9CF268611f0](https://goerli.etherscan.io/address/0x3baD5566ca28Bc698E9d7F26117Ae9CF268611f0)  |
| NFT      | [0x64a69a381d25271185BDCc9458e3313634880689](https://goerli.etherscan.io/address/0x64a69a381d25271185BDCc9458e3313634880689)  |
| Auction  | [0x6bBa2E9ec348b66eae13bFa5A79C64CE9e79ac76](https://goerli.etherscan.io/address/0x6bBa2E9ec348b66eae13bFa5A79C64CE9e79ac76)  |
