/* This file is generated by zits. Do not edit manually */

// @ts-ignore
import {PLAYSET_DEFAULT_COORDINATOR_ZOME_NAME, WHERE_DEFAULT_COORDINATOR_ZOME_NAME, WHERE_DEFAULT_INTEGRITY_ZOME_NAME, WHERE_DEFAULT_ROLE_NAME, Message, WhereEntry, AddHereInput, CreateNextSessionInput, GetSessionInput, Here, HereOutput, NotifyInput, PlacementSession, SignalPayload, SpaceSessionsInput, UpdateHereInput, } from './where.types';
// @ts-ignore
import {
// @ts-ignore
WebsocketConnectionOptions, KitsuneAgent, KitsuneSpace, HoloHashB64, AgentPubKeyB64, DnaHashB64, WasmHashB64, EntryHashB64, ActionHashB64, AnyDhtHashB64, InstalledAppId, Signature, CellId, DnaProperties, RoleName, InstalledCell, Timestamp, Duration, HoloHashed, NetworkInfo, FetchPoolInfo,
/** hdk/action.ts */
// @ts-ignore
SignedActionHashed, RegisterAgentActivity, ActionHashed, ActionType, Action, NewEntryAction, Dna, AgentValidationPkg, InitZomesComplete, CreateLink, DeleteLink, OpenChain, CloseChain, Update, Delete, Create,
/** hdk/capabilities.ts */
// @ts-ignore
CapSecret, CapClaim, GrantedFunctionsType, GrantedFunctions, ZomeCallCapGrant, CapAccessType, CapAccess, CapGrant,
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
// @ts-ignore
DhtOpType, DhtOp, getDhtOpType, getDhtOpAction, getDhtOpEntry, getDhtOpSignature,
/** hdk/entry.ts */
// @ts-ignore
EntryVisibility, AppEntryDef, EntryType, EntryContent, Entry,
/** hdk/record.ts */
// @ts-ignore
Record as HcRecord, RecordEntry as HcRecordEntry,
/** hdk/link.ts */
//AnyLinkableHash,
// @ts-ignore
ZomeIndex, LinkType, LinkTag, RateWeight, RateBucketId, RateUnits, Link,
/** api/admin/types.ts */
// @ts-ignore
InstalledAppInfoStatus, DeactivationReason, DisabledAppReason, StemCell, ProvisionedCell, ClonedCell, CellType, CellInfo, AppInfo, MembraneProof, FunctionName, ZomeName, ZomeDefinition, IntegrityZome, CoordinatorZome, DnaDefinition, ResourceBytes, ResourceMap, CellProvisioningStrategy, CellProvisioning, DnaVersionSpec, DnaVersionFlexible, AppRoleDnaManifest, AppRoleManifest, AppManifest, AppBundle, AppBundleSource, NetworkSeed, ZomeLocation,
} from '@holochain/client';


/// Simple Hashes
// @ts-ignore
type AgentArray = Uint8Array;
// @ts-ignore
type DnaArray = Uint8Array;
// @ts-ignore
type WasmArray = Uint8Array;
// @ts-ignore
type EntryArray = Uint8Array;
// @ts-ignore
type ActionArray = Uint8Array;
// @ts-ignore
type AnyDhtArray = Uint8Array;
// @ts-ignore
type AnyLinkableArray = Uint8Array;
// @ts-ignore
type ExternalArray = Uint8Array;

// @ts-ignore
import {
/** Common */
// @ts-ignore
DhtOpHashB64, DhtOpHash,
/** DnaFile */
// @ts-ignore
DnaFile, DnaDef, Zomes, WasmCode,
/** entry-details */
// @ts-ignore
EntryDetails, RecordDetails, Details, DetailsType, EntryDhtStatus,
/** Validation */
// @ts-ignore
ValidationStatus, ValidationReceipt,
} from '@holochain-open-dev/core-types';

import {ZomeProxy} from '@ddd-qc/lit-happ';
import {whereFunctionNames} from './where.fn';
import {WhereUnitEnum, WhereLinkType} from './where.integrity';

/**
 *
 */
export class WhereProxy extends ZomeProxy {
  static override readonly DEFAULT_ZOME_NAME = "zWhere";
  static override readonly FN_NAMES = whereFunctionNames;
  static override readonly ENTRY_TYPES = Object.values(WhereUnitEnum);
  static override readonly LINK_TYPES = Object.values(WhereLinkType);
 
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

  async hideSpace(spaceEh64: EntryHashB64): Promise<ActionArray> {
    return this.call('hide_space', spaceEh64);
  }

  async unhideSpace(spaceEh64: EntryHashB64): Promise<void> {
    return this.call('unhide_space', spaceEh64);
  }

  async getHiddenSpaces(): Promise<EntryHashB64[]> {
    return this.call('get_hidden_spaces', null);
  }

  async getRecordAuthor(dh: AnyDhtArray): Promise<AgentArray> {
    return this.call('get_record_author', dh);
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
