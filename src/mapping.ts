import { BigInt } from "@graphprotocol/graph-ts"
import {
  Auction,
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
import { ExampleEntity } from "../generated/schema"

export function handleAdminChanged(event: AdminChanged): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count.plus(BigInt.fromI32(1))

  // Entity fields can be set based on event parameters
  entity.to = event.params.to

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let auction = Auction.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - auction.allowedNFT(...)
  // - auction.auctionDuration(...)
  // - auction.authorRoyaltyNumerator(...)
  // - auction.getAdmin(...)
  // - auction.getAuctionData(...)
  // - auction.getPaused(...)
  // - auction.getRevision(...)
  // - auction.minPriceStepNumerator(...)
  // - auction.nftAuction2nftID2auction(...)
  // - auction.overtimeWindow(...)
  // - auction.payableToken(...)
  // - auction.stub(...)
}

export function handleAuctionCanceled(event: AuctionCanceled): void {}

export function handleAuctionCreated(event: AuctionCreated): void {}

export function handleAuctionDurationSet(event: AuctionDurationSet): void {}

export function handleAuthorRoyaltyNumeratorSet(
  event: AuthorRoyaltyNumeratorSet
): void {}

export function handleBidSubmitted(event: BidSubmitted): void {}

export function handleMinPriceStepNumeratorSet(
  event: MinPriceStepNumeratorSet
): void {}

export function handleOvertimeWindowSet(event: OvertimeWindowSet): void {}

export function handlePaused(event: Paused): void {}

export function handleReservePriceChanged(event: ReservePriceChanged): void {}

export function handleRoyaltyPaid(event: RoyaltyPaid): void {}

export function handleUnpaused(event: Unpaused): void {}

export function handleWonNftClaimed(event: WonNftClaimed): void {}
