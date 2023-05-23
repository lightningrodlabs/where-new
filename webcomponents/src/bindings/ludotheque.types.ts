/* This file is generated by zits. Do not edit manually */

import {
/** types.ts */
HoloHash,
AgentPubKey,
DnaHash,
WasmHash,
EntryHash,
ActionHash,
AnyDhtHash,
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
Timestamp,
Duration,
HoloHashed,
NetworkInfo,
FetchQueueInfo,
/** hdk/action.ts */
SignedActionHashed,
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
ZomeCallCapGrant,
CapAccess,
CapGrant,
GrantedFunctionsType,
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
/** api/admin/types.ts */
InstalledAppInfoStatus,
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

import {
/** Common */
DhtOpHashB64,
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

export interface ExportPlaysetInput {
  destinationCellId: CellId
  playsetEh: EntryHashB64
}

/** warning: duplicate struct in ludotheque zome */
export interface ImportPieceInput {
  piece_type_name: string
  piece_entry: Entry
}

export interface PlaysetOutput {
  hash: EntryHashB64
  content: Playset
}

export enum LudothequeEntryType {
	Playset = 'Playset',
}
export type LudothequeEntryVariantPlayset = {Playset: Playset}
export type LudothequeEntry = 
 | LudothequeEntryVariantPlayset;

/** List of all link kinds handled by this Zome */
export type LudothequeLinkType =
  | {All: null};
export enum LudothequeLinkTypeType {
	All = 'All',
}

/** Playset Entry */
export interface Playset {
  name: string
  description: string
  templates: EntryHashB64[]
  svgMarkers: EntryHashB64[]
  emojiGroups: EntryHashB64[]
  spaces: EntryHashB64[]
}
