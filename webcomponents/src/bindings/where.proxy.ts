/* This file is generated by zits. Do not edit manually */

import {PLAYSET_DEFAULT_COORDINATOR_ZOME_NAME, WHERE_DEFAULT_ROLE_NAME, WHERE_DEFAULT_COORDINATOR_ZOME_NAME, WHERE_DEFAULT_INTEGRITY_ZOME_NAME, Message, WhereEntry, WhereLinkType, AddHereInput, UpdateHereInput, HereOutput, GetSessionInput, SpaceSessionsInput, CreateNextSessionInput, SignalPayload, NotifyInput, PlacementSession, Here, } from './where.types';
import {
/** types.ts */
HoloHash,
AgentPubKey,
DnaHash,
WasmHash,
EntryHash,
ActionHash,
AnyDhtHash,
ExternalHash,
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

import {ZomeProxy} from '@ddd-qc/lit-happ';
import {whereFunctionNames} from './where.fn';

/**
 *
 */
export class WhereProxy extends ZomeProxy {
  static readonly DEFAULT_ZOME_NAME = "zWhere"
  static readonly FN_NAMES = whereFunctionNames
 
  async addHere(input: AddHereInput): Promise<ActionHashB64> {
    return this.call('add_here', input);
  }

  async updateHere(input: UpdateHereInput): Promise<ActionHashB64> {
    return this.call('update_here', input);
  }

  async deleteHere(linkAh: ActionHashB64): Promise<void> {
    return this.call('delete_here', linkAh);
  }

  async getHeres(sessionEh: EntryHashB64): Promise<HereOutput[]> {
    return this.call('get_heres', sessionEh);
  }

  async hideSpace(spaceEh64: EntryHashB64): Promise<ActionHash> {
    return this.call('hide_space', spaceEh64);
  }

  async unhideSpace(spaceEh64: EntryHashB64): Promise<void> {
    return this.call('unhide_space', spaceEh64);
  }

  async getHiddenSpaces(): Promise<EntryHashB64[]> {
    return this.call('get_hidden_spaces', null);
  }


  async getSession(input: GetSessionInput): Promise<EntryHashB64 | null> {
    return this.call('get_session', input);
  }

  async getSessionFromEh(sessionEh: EntryHashB64): Promise<PlacementSession | null> {
    return this.call('get_session_from_eh', sessionEh);
  }

  async getSpaceSessions(spaceEh: EntryHashB64): Promise<EntryHashB64[]> {
    return this.call('get_space_sessions', spaceEh);
  }

  async createSessions(input: SpaceSessionsInput): Promise<EntryHashB64[]> {
    return this.call('create_sessions', input);
  }

  async createNextSession(input: CreateNextSessionInput): Promise<[EntryHashB64, number]> {
    return this.call('create_next_session', input);
  }


  async notifyPeers(input: NotifyInput): Promise<void> {
    return this.call('notify_peers', input);
  }
}
