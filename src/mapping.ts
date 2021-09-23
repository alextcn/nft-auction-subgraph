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
import { ActiveListingID, Listing } from "../generated/schema"


export function handleAuctionCreated(event: AuctionCreated): void {
  const id = event.transaction.hash.toHex() + "-" + event.logIndex.toString()

  const _id = new ActiveListingID(alid(event.params.nft, event.params.nftId))
  _id.listingId = id
  _id.save()

  const listing = new Listing(id)
  listing.status = 'Created'
  listing.nft = event.params.nft
  listing.nftId = event.params.nftId
  listing.author = event.transaction.from
  listing.endTimestamp = new BigInt(0)
  listing.save()
}

export function handleAuctionCanceled(event: AuctionCanceled): void {
  const id = findActiveNftListingId(event.params.nft, event.params.nftId)
  if (id === null) return

  store.remove('ActiveListingID', alid(event.params.nft, event.params.nftId))

  const listing = new Listing(id)
  listing.status = 'Cancelled'
  listing.save()
}

export function handleBidSubmitted(event: BidSubmitted): void {
  const id = findActiveNftListingId(event.params.nft, event.params.nftId)
  if (id === null) return
  
  const listing = new Listing(id)
  listing.status = 'Active'
  listing.bidder = event.params.bidder
  listing.bid = event.params.amount
  listing.endTimestamp = event.params.endTimestamp
  listing.save()
}

export function handleReservePriceChanged(event: ReservePriceChanged): void {
  const id = findActiveNftListingId(event.params.nft, event.params.nftId)
  if (id === null) return

  let listing = new Listing(id)
  listing.bid = event.params.startPrice
  listing.save()
}

export function handleWonNftClaimed(event: WonNftClaimed): void {
  const id = findActiveNftListingId(event.params.nft, event.params.nftId)
  if (id === null) return
  
  store.remove('ActiveListingID', alid(event.params.nft, event.params.nftId))
  
  const listing = new Listing(id)
  listing.status = 'Finished'
  listing.save()
}

// returns id of active Listing for specific NFT
function findActiveNftListingId(nft: Address, nftId: BigInt): string | null  {
  const id = ActiveListingID.load(alid(nft, nftId))
  return id ? id.listingId : null
}

// returns id of ActiveListingID for specific NFT
function alid(nft: Address, nftId: BigInt): string {
  return nft.toHexString() + '-' + nftId.toHexString()
}