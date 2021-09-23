import { Address, BigInt, ethereum, store } from "@graphprotocol/graph-ts"
import {
  Auction as AuctionContract,
  AdminChanged,
  AuctionCanceled,
  AuctionCreated,
  AuctionDurationSet,
  AuthorRoyaltyNumeratorSet,
  BidSubmitted,
  MinPriceStepNumeratorSet,
  OvertimeWindowSet,
  Paused,
  ReservePriceChanged,
  RoyaltyPaid,
  Unpaused,
  WonNftClaimed
} from "../generated/Auction/Auction"
import { Action, ActiveListingID, Listing, NFT, User } from "../generated/schema"


export function handleAuctionCreated(event: AuctionCreated): void {
  const nftId = getNftId(event.params.nft, event.params.nftId)
  const listingId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()

  const user = createUser(event.transaction.from)
  const nft = createNft(event.params.nft, event.params.nftId)

  const _id = new ActiveListingID(nftId)
  _id.listingId = listingId
  _id.save()

  const listing = new Listing(listingId)
  listing.status = 'Created'
  listing.nft = nft.id
  listing.author = user.id
  listing.endTimestamp = new BigInt(0)
  listing.save()

  createAction(event, listing.id, user.id, nft.id, 'List')
}

export function handleAuctionCanceled(event: AuctionCanceled): void {
  const listingId = findActiveNftListingId(event.params.nft, event.params.nftId)!
  const nftId = getNftId(event.params.nft, event.params.nftId)
  const user = createUser(event.transaction.from) // can be called by admin who hasn't been created before

  store.remove('ActiveListingID', nftId)

  const listing = new Listing(listingId)
  listing.status = 'Cancelled'
  listing.save()

  createAction(event, listing.id, user.id, nftId, 'Cancel')
}

export function handleBidSubmitted(event: BidSubmitted): void {
  const listingId = findActiveNftListingId(event.params.nft, event.params.nftId)!
  const nftId = getNftId(event.params.nft, event.params.nftId)
  const bidder = createUser(event.transaction.from)
  
  const listing = new Listing(listingId)
  listing.status = 'Active'
  listing.bidder = bidder.id
  listing.bid = event.params.amount
  listing.endTimestamp = event.params.endTimestamp
  listing.save()

  // TODO: add price value
  createAction(event, listing.id, bidder.id, nftId, 'Bid')
}

export function handleReservePriceChanged(event: ReservePriceChanged): void {
  const id = findActiveNftListingId(event.params.nft, event.params.nftId)!
  const nftId = getNftId(event.params.nft, event.params.nftId)
  const user = createUser(event.transaction.from) // can be called by admin who hasn't been created before

  let listing = new Listing(id)
  listing.bid = event.params.startPrice // TODO: set to startPrice
  listing.save()

  // TODO: add price value
  createAction(event, listing.id, user.id, nftId, 'UpdateStartPrice')
}

export function handleWonNftClaimed(event: WonNftClaimed): void {
  const listingId = findActiveNftListingId(event.params.nft, event.params.nftId)!
  const nftId = getNftId(event.params.nft, event.params.nftId)
  
  store.remove('ActiveListingID', nftId)
  
  const listing = new Listing(listingId)
  listing.status = 'Finished'
  listing.save()

  // TODO: add price value
  const winnerId = getUserId(event.params.winner)
  createAction(event, listing.id, winnerId, nftId, 'Claim')
}


// returns id of active Listing for specific NFT token
function findActiveNftListingId(nft: Address, tokenId: BigInt): string | null  {
  const id = ActiveListingID.load(getNftId(nft, tokenId))
  return id ? id.listingId : null
}

// returns string id of NFT token
function getNftId(nft: Address, tokenId: BigInt): string {
  return nft.toHexString() + '-' + tokenId.toHexString()
}

// returns string id of User
function getUserId(address: Address): string {
  return address.toHexString()
}

// creates user entity if not created yet and returns it
function createUser(address: Address): User {
  let user = User.load(getUserId(address))
  if (user === null) {
    user = new User(address.toHexString())
    user.save()
  }
  return user
}

// creates nft entity if not created yet and returns it
function createNft(nftAddress: Address, tokenId: BigInt): NFT {
  const nftId = getNftId(nftAddress, tokenId)
  let nft = NFT.load(nftId)
  if (nft === null) {
    nft = new NFT(nftId)
    nft.address = nftAddress
    nft.tokenId = tokenId
    nft.save()
  }
  return nft
}

// create and saves Action entity
function createAction(event: ethereum.Event, listingId: string, nftId: string, 
  userId: string, actionType: string): void {
  const action = new Action(event.transaction.hash.toHex())
  action.user = userId
  action.nft = nftId
  action.listing = listingId
  action.type = actionType
  action.blockNumber = event.block.number
  action.timestamp = event.block.timestamp
  action.save()
}