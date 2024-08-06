/* This file is generated by zits. Do not edit manually */

import {
WebsocketConnectionOptions,
/** types.ts */
//HoloHash,
//AgentPubKey,
//DnaHash,
//WasmHash,
//EntryHash,
//ActionHash,
//AnyDhtHash,
//ExternalHash,
KitsuneAgent,
KitsuneSpace,
HoloHashB64,
AgentPubKeyB64,
DnaHashB64,
WasmHashB64,
EntryHashB64,
ActionHashB64,
AnyDhtHashB64,
InstalledAppId,
Signature,
CellId,
DnaProperties,
RoleName,
InstalledCell,
Timestamp,
Duration,
HoloHashed,
NetworkInfo,
FetchPoolInfo,
/** hdk/action.ts */
SignedActionHashed,
RegisterAgentActivity,
ActionHashed,
ActionType,
Action,
NewEntryAction,
Dna,
AgentValidationPkg,
InitZomesComplete,
CreateLink,
DeleteLink,
OpenChain,
CloseChain,
Update,
Delete,
Create,
/** hdk/capabilities.ts */
CapSecret,
CapClaim,
GrantedFunctionsType,
GrantedFunctions,
ZomeCallCapGrant,
CapAccessType,
CapAccess,
CapGrant,
///** hdk/countersigning.ts */
//CounterSigningSessionData,
//PreflightRequest,
//CounterSigningSessionTimes,
//ActionBase,
//CounterSigningAgents,
//PreflightBytes,
//Role,
//CountersigningAgentState,
/** hdk/dht-ops.ts */
DhtOpType,
DhtOp,
getDhtOpType,
getDhtOpAction,
getDhtOpEntry,
getDhtOpSignature,
/** hdk/entry.ts */
EntryVisibility,
AppEntryDef,
EntryType,
EntryContent,
Entry,
/** hdk/record.ts */
Record as HcRecord,
RecordEntry as HcRecordEntry,
/** hdk/link.ts */
AnyLinkableHash,
ZomeIndex,
LinkType,
LinkTag,
RateWeight,
RateBucketId,
RateUnits,
Link,
/** api/admin/types.ts */
InstalledAppInfoStatus,
DeactivationReason,
DisabledAppReason,
StemCell,
ProvisionedCell,
ClonedCell,
CellType,
CellInfo,
AppInfo,
MembraneProof,
FunctionName,
ZomeName,
ZomeDefinition,
IntegrityZome,
CoordinatorZome,
DnaDefinition,
ResourceBytes,
ResourceMap,
CellProvisioningStrategy,
CellProvisioning,
DnaVersionSpec,
DnaVersionFlexible,
AppRoleDnaManifest,
AppRoleManifest,
AppManifest,
AppBundle,
AppBundleSource,
NetworkSeed,
ZomeLocation,
   } from '@holochain/client';


/// Simple Hashes
type AgentArray = Uint8Array;
type DnaArray = Uint8Array;
type WasmArray = Uint8Array;
type EntryArray = Uint8Array;
type ActionArray = Uint8Array;
type AnyDhtArray = Uint8Array;
type AnyLinkableArray = Uint8Array;
type ExternalArray = Uint8Array;

import {
/** Common */
DhtOpHashB64,
//DnaHashB64, (duplicate)
//AnyDhtHashB64, (duplicate)
DhtOpHash,
/** DnaFile */
DnaFile,
DnaDef,
Zomes,
WasmCode,
/** entry-details */
EntryDetails,
RecordDetails,
Details,
DetailsType,
EntryDhtStatus,
/** Validation */
ValidationStatus,
ValidationReceipt,
   } from '@holochain-open-dev/core-types';

export interface ExportPieceInput {
  cellId: CellId
  pieceEh: EntryHashB64
  pieceTypeName: string
}

export interface ExportSpaceInput {
  cellId: CellId
  spaceEh: EntryHashB64
}

export interface ExportSpaceOutput {
  template: EntryHashB64
  maybeSvg?: EntryHashB64
  maybeEmojiGroup?: EntryHashB64
}

export interface GetInventoryOutput {
  templates: EntryHashB64[]
  svgMarkers: EntryHashB64[]
  emojiGroups: EntryHashB64[]
  spaces: EntryHashB64[]
}

export interface ImportPieceInput {
  piece_type_name: string
  piece_entry: Entry
}

export interface EmojiGroupOutput {
  hash: EntryHashB64
  content: EmojiGroup
}

/**  */
export interface SpaceOutput {
  hash: EntryHashB64
  content: Space
}

export interface SvgMarkerOutput {
  hash: EntryHashB64
  content: SvgMarker
}

export interface TemplateOutput {
  hash: EntryHashB64
  content: Template
}

export enum PlaysetEntryType {
	SvgMarker = 'SvgMarker',
	EmojiGroup = 'EmojiGroup',
	Template = 'Template',
	Space = 'Space',
}
export type PlaysetEntryVariantSvgMarker = {SvgMarker: SvgMarker}
export type PlaysetEntryVariantEmojiGroup = {EmojiGroup: EmojiGroup}
export type PlaysetEntryVariantTemplate = {Template: Template}
export type PlaysetEntryVariantSpace = {Space: Space}
export type PlaysetEntry = 
 | PlaysetEntryVariantSvgMarker | PlaysetEntryVariantEmojiGroup | PlaysetEntryVariantTemplate | PlaysetEntryVariantSpace;

/** EmojiGroup Entry */
export interface EmojiGroup {
  name: string
  description: string
  unicodes: string[]
}

export enum MarkerPieceType {
	Svg = 'Svg',
	EmojiGroup = 'EmojiGroup',
}
export type MarkerPieceVariantSvg = {svg: EntryHashB64}
export type MarkerPieceVariantEmojiGroup = {emojiGroup: EntryHashB64}
export type MarkerPiece = 
 | MarkerPieceVariantSvg | MarkerPieceVariantEmojiGroup;

/** Space entry definition */
export interface Space {
  name: string
  origin: EntryHashB64
  surface: string
  maybeMarkerPiece?: MarkerPiece
  meta: Record<string, string>
}

/** SvgMarker Entry */
export interface SvgMarker {
  name: string
  value: string
}

/** Template Entry */
export interface Template {
  name: string
  surface: string
}
