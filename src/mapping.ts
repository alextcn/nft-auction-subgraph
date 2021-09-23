import { Address, BigInt, store } from "@graphprotocol/graph-ts"
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
import { ActiveListingID, Listing, NFT, User } from "../generated/schema"


export function handleAuctionCreated(event: AuctionCreated): void {
  const _nftId = getNftId(event.params.nft, event.params.nftId)
  const listingId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()

  const _id = new ActiveListingID(_nftId)
  _id.listingId = listingId
  _id.save()

  const from = createUser(event.transaction.from)
  const nft = createNft(event.params.nft, event.params.nftId)

  const listing = new Listing(listingId)
  listing.status = 'Created'
  listing.nft = nft.id
  listing.author = from.id
  listing.endTimestamp = new BigInt(0)
  listing.save()
}

export function handleAuctionCanceled(event: AuctionCanceled): void {
  const id = findActiveNftListingId(event.params.nft, event.params.nftId)
  if (id === null) return

  // can be called by admin who hasn't been created before
  createUser(event.transaction.from)

  store.remove('ActiveListingID', getNftId(event.params.nft, event.params.nftId))

  const listing = new Listing(id)
  listing.status = 'Cancelled'
  listing.save()
}

export function handleBidSubmitted(event: BidSubmitted): void {
  const id = findActiveNftListingId(event.params.nft, event.params.nftId)
  if (id === null) return

  const bidder = createUser(event.transaction.from)
  
  const listing = new Listing(id)
  listing.status = 'Active'
  listing.bidder = bidder.id
  listing.bid = event.params.amount
  listing.endTimestamp = event.params.endTimestamp
  listing.save()
}

export function handleReservePriceChanged(event: ReservePriceChanged): void {
  const id = findActiveNftListingId(event.params.nft, event.params.nftId)
  if (id === null) return

  // can be called by admin who hasn't been created before
  createUser(event.transaction.from)

  let listing = new Listing(id)
  listing.bid = event.params.startPrice
  listing.save()
}

export function handleWonNftClaimed(event: WonNftClaimed): void {
  const id = findActiveNftListingId(event.params.nft, event.params.nftId)
  if (id === null) return
  
  store.remove('ActiveListingID', getNftId(event.params.nft, event.params.nftId))
  
  const listing = new Listing(id)
  listing.status = 'Finished'
  listing.save()
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

// creates user entity if not created yet and returns it
function createUser(address: Address): User {
  let user = User.load(address.toHexString())
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