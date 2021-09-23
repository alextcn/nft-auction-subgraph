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
import { ActiveListingID, Listing, NFT } from "../generated/schema"


export function handleAuctionCreated(event: AuctionCreated): void {
  const _nftId = nftId(event.params.nft, event.params.nftId)
  const listingId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()

  const _id = new ActiveListingID(_nftId)
  _id.listingId = listingId
  _id.save()

  let nft = NFT.load(_nftId)
  if (!nft) {
    nft = new NFT(_nftId)
    nft.address = event.params.nft
    nft.tokenId = event.params.nftId
    nft.save()
  }

  const listing = new Listing(listingId)
  listing.status = 'Created'
  listing.nft = nft.id
  listing.author = event.transaction.from
  listing.endTimestamp = new BigInt(0)
  listing.save()
}

export function handleAuctionCanceled(event: AuctionCanceled): void {
  const id = findActiveNftListingId(event.params.nft, event.params.nftId)
  if (id === null) return

  store.remove('ActiveListingID', nftId(event.params.nft, event.params.nftId))

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
  
  store.remove('ActiveListingID', nftId(event.params.nft, event.params.nftId))
  
  const listing = new Listing(id)
  listing.status = 'Finished'
  listing.save()
}

// returns id of active Listing for specific NFT token
function findActiveNftListingId(nft: Address, tokenId: BigInt): string | null  {
  const id = ActiveListingID.load(nftId(nft, tokenId))
  return id ? id.listingId : null
}

// returns string id of NFT token
function nftId(nft: Address, tokenId: BigInt): string {
  return nft.toHexString() + '-' + tokenId.toHexString()
}