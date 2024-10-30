/* This file is generated by zits. Do not edit manually */

// @ts-ignore
import {MarkerPiece, PlaysetEntry, EmojiGroup, EmojiGroupOutput, ExportPieceInput, ExportSpaceInput, ExportSpaceOutput, GetInventoryOutput, ImportPieceInput, Space, SpaceOutput, SvgMarker, SvgMarkerOutput, Template, TemplateOutput, } from './playset.types';
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
import {playsetFunctionNames} from './playset.fn';
import {PlaysetUnitEnum, PlaysetLinkType} from './playset.integrity';

/**
 *
 */
export class PlaysetProxy extends ZomeProxy {
  static override readonly DEFAULT_ZOME_NAME = "zPlayset";
  static override readonly FN_NAMES = playsetFunctionNames;
  static override readonly ENTRY_TYPES = Object.values(PlaysetUnitEnum);
  static override readonly LINK_TYPES = Object.values(PlaysetLinkType);
 
  async exportPiece(input: ExportPieceInput): Promise<void> {
    return this.call('export_piece', input);
  }

  async exportSpace(input: ExportSpaceInput): Promise<ExportSpaceOutput> {
    return this.call('export_space', input);
  }

  async getInventory(): Promise<GetInventoryOutput> {
    return this.call('get_inventory', null);
  }

  async importPiece(input: ImportPieceInput): Promise<void> {
    return this.call('import_piece', input);
  }

  async getRecordAuthor(dh: AnyDhtArray): Promise<AgentArray> {
    return this.call('get_record_author', dh);
  }

  async createEmojiGroup(input: EmojiGroup): Promise<EntryHashB64> {
    return this.call('create_emoji_group', input);
  }

  async getEmojiGroup(input: EntryHashB64): Promise<EmojiGroup | null> {
    return this.call('get_emoji_group', input);
  }

  async getAllEmojiGroups(): Promise<EmojiGroupOutput[]> {
    return this.call('get_all_emoji_groups', null);
  }

  async createSpace(input: Space): Promise<EntryHashB64> {
    return this.call('create_space', input);
  }

  async getSpace(spaceEh: EntryHashB64): Promise<Space | null> {
    return this.call('get_space', spaceEh);
  }

  async getSpaces(): Promise<SpaceOutput[]> {
    return this.call('get_spaces', null);
  }

  async createSvgMarker(input: SvgMarker): Promise<EntryHashB64> {
    return this.call('create_svg_marker', input);
  }

  async getSvgMarker(input: EntryHashB64): Promise<SvgMarker | null> {
    return this.call('get_svg_marker', input);
  }

  async getSvgMarkers(): Promise<SvgMarkerOutput[]> {
    return this.call('get_svg_markers', null);
  }

  async createTemplate(input: Template): Promise<EntryHashB64> {
    return this.call('create_template', input);
  }

  async getTemplate(input: EntryHashB64): Promise<Template | null> {
    return this.call('get_template', input);
  }

  async getTemplates(): Promise<TemplateOutput[]> {
    return this.call('get_templates', null);
  }
}
