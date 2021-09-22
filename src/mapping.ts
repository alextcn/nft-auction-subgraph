import { BigInt, store } from "@graphprotocol/graph-ts"
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
import { Auction } from "../generated/schema"


export function handleAuctionCreated(event: AuctionCreated): void {
  const id = event.params.nft.toHexString() + '-' + event.params.nftId.toHexString()

  const auction = new Auction(id)
  auction.nft = event.params.nft
  auction.nftId = event.params.nftId
  auction.author = event.transaction.from
  auction.endTimestamp = new BigInt(0)

  auction.save()
}

export function handleAuctionCanceled(event: AuctionCanceled): void {
  const id = event.params.nft.toHexString() + '-' + event.params.nftId.toHexString()
  
  store.remove('Auction', id)
}

export function handleBidSubmitted(event: BidSubmitted): void {
  const id = event.params.nft.toHexString() + '-' + event.params.nftId.toHexString()

  let auction = new Auction(id)

  auction.bidder = event.params.bidder
  auction.bid = event.params.amount
  auction.endTimestamp = event.params.endTimestamp

  auction.save()
}

export function handleReservePriceChanged(event: ReservePriceChanged): void {
  const id = event.params.nft.toHexString() + '-' + event.params.nftId.toHexString()

  let auction = new Auction(id)
  auction.bid = event.params.startPrice
  auction.save()
}

export function handleWonNftClaimed(event: WonNftClaimed): void {
  const id = event.params.nft.toHexString() + '-' + event.params.nftId.toHexString()

  store.remove('Auction', id)
}

// export function handleAuctionDurationSet(event: AuctionDurationSet): void {}

// export function handleAuthorRoyaltyNumeratorSet(
//   event: AuthorRoyaltyNumeratorSet
// ): void {}

export function handleMinPriceStepNumeratorSet(
  event: MinPriceStepNumeratorSet
): void {}

export function handleOvertimeWindowSet(event: OvertimeWindowSet): void {}

export function handleRoyaltyPaid(event: RoyaltyPaid): void {}
