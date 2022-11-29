import {EntryHashB64, ActionHashB64, AgentPubKeyB64, Dictionary} from '@holochain-open-dev/core-types';
import {WhereProxy} from './where.proxy';
import {Coord, WhereLocation, convertLocationToHere, WherePerspective, LocationInfo,
  HereInfo, convertHereToLocation, PlacementSession, PlayManifest
} from "./where.perspective";
import {ZomeViewModel} from "@ddd-qc/dna-client";
import {WhereSignal} from "./where.signals";


/**
 *
 */
export class WhereZvm extends ZomeViewModel {

  static readonly ZOME_PROXY = WhereProxy;
  get zomeProxy(): WhereProxy {return this._zomeProxy as WhereProxy;}

  /* */
  protected hasChanged(): boolean {
    // TODO
    return true;
  }


  /** */
  async probeAll() {
    console.log("whereZvm.probeAll()", this.perspective)
    for (const spaceEh of Object.keys(this._manifests)) {
      const maybeManifest = await this.probeManifest(spaceEh); // TODO optimize
      if (!maybeManifest) continue;
      console.log("whereZvm.probeAll()", maybeManifest)
      for (const sessionEh of Object.values(maybeManifest.sessionEhs)) {
        await this.probeSession(sessionEh); // TODO optimize
      }
    }
    await this.probeVisibilityForAll();
  }


  /** -- Perspective -- */

  /* */
  get perspective(): WherePerspective {
    return {
      manifests: this._manifests,
      sessions: this._sessions,
    };
  }

  /** SpaceEh -> Play */
  //private _plays: Dictionary<Play> = {};
  /** SpaceEh -> PlayManifest */
  private _manifests: Dictionary<PlayManifest> = {};
  /** SpaceEh -> sessionEh */
  //private _currentSessions: Dictionary<EntryHashB64> = {};
  /** SessionEh -> PlacementSession */
  private _sessions: Dictionary<PlacementSession> = {};
  /* SessionEh -> [locations] */
  //private _locations: Dictionary<LocationInfo[]> = {};

  //getPlay(eh: EntryHashB64): Play | undefined {return this._plays[eh]}
  getManifest(eh: EntryHashB64): PlayManifest | undefined {return this._manifests[eh]}
  //getCurrentSession(eh: EntryHashB64): EntryHashB64 | undefined {return this._currentSessions[eh]}
  getSession(eh: EntryHashB64): PlacementSession | undefined {return this._sessions[eh]}
  getLocations(eh: EntryHashB64): (LocationInfo | null)[] | undefined {return this._sessions[eh].locations}


  getHiddenSpaces(): EntryHashB64[] {
    let hiddens = [];
    for (const [eh, manifest] of Object.entries(this._manifests)) {
      if (!manifest.visible) {
        hiddens.push(eh);
      }
    }
    return hiddens;
  }


  /** */
  getVisibleSpaces(): EntryHashB64[] {
    let hiddenEhs = this.getHiddenSpaces();
    let visibles = [];
    for (const manifest of Object.values(this._manifests)) {
      if (!hiddenEhs.includes(manifest.spaceEh)) {
        visibles.push(manifest.spaceEh)
      }
    }
    return visibles;
  }



  /** */
  isSpaceVisible(spaceEh: EntryHashB64): boolean {
    const visibles = this.getVisibleSpaces();
    //console.log({visibles})
    for (const visibleSpaceEh of visibles) {
      if (visibleSpaceEh == spaceEh) {
        return true;
      }
    }
    return false;
  }


  /** -- Methods -- */

  /** */
  notifyPeers(signal: WhereSignal, folks: Array<AgentPubKeyB64>) {
    this.zomeProxy.notifyPeers(signal, folks)
  }

  /** Returns list of hidden spaces */
  async probeVisibilityForAll(): Promise<EntryHashB64[]> {
    const hiddens = await this.zomeProxy.getHiddenSpaces();
    for (const hiddenEh of hiddens) {
      if (this.getManifest(hiddenEh)) {
        this._manifests[hiddenEh].visible = false;
      }
    }
    this.notifySubscribers();
    return hiddens;
  }


  /** */
  async probeManifest(spaceEh: EntryHashB64): Promise<PlayManifest | null> {
      const sessionEhs = await this.zomeProxy.getSpaceSessions(spaceEh);
      if (sessionEhs.length == 0) {
        return null;
      }
      await this.probeVisibilityForAll(); // TODO: make this optional when probing all plays
      let manifest = this.getManifest(spaceEh);
      if (!manifest) {
        manifest = {
          spaceEh: spaceEh,
          visible: true,
          sessionEhs: sessionEhs,
        };
        //console.error("Session found but no manifest:", spaceEh, this.perspective)
        //return Promise.reject("Inconsistant state: Manifest not found although sessions where found.")
      } else {
        manifest.sessionEhs = sessionEhs;
      }
      this._manifests[spaceEh] = manifest;
      this.notifySubscribers();
      return manifest;
  }


  /** */
  async probeSession(sessionEh: EntryHashB64): Promise<PlacementSession> {
    const entry = await this.zomeProxy.getSessionFromEh(sessionEh);
    if (!entry) {
      console.error("fetchSession(): Session entry not found")
      return Promise.reject("fetchSession(): Session entry not found");
    }
    const session: PlacementSession = {
      name: entry.name,
      index: entry.index,
      locations: await this.probeLocations(sessionEh)
    };
    this._sessions[sessionEh] = session;
    this.notifySubscribers();
    return session;
  }


  /** */
  private async probeLocations(sessionEh: EntryHashB64): Promise<Array<LocationInfo>> {
    const hereInfos = await this.zomeProxy.getHeres(sessionEh);
    //console.debug({hereInfos})
    const locs = hereInfos.map((info: HereInfo) => {
      return convertHereToLocation(info)
    });
    //this._locations[sessionEh] = locs;
    //this.notifySubscribers();
    return locs;
  }


  /** -- Sessions -- */

  /** Add Session to Perspective */
  private addSession(spaceEh: EntryHashB64, name: string, sessionEh: EntryHashB64, index: number): PlacementSession {
    if (!this._manifests[spaceEh]) {
      this._manifests[spaceEh] = {spaceEh, visible: true, sessionEhs: [sessionEh]} as PlayManifest;
    }
    this._manifests[spaceEh].sessionEhs.push(sessionEh);
    const session: PlacementSession = {name, index, locations: []};
    this._sessions[sessionEh] = session;
    return session;
  }


  /** */
  async createNextSession(spaceEh: EntryHashB64, name: string): Promise<EntryHashB64> {
    const [eh, index] = await this.zomeProxy.createNextSession(spaceEh, name);
    this.addSession(spaceEh, name, eh, index);
    this.notifySubscribers();
    return eh;
  }


  /** */
  async createSessions(spaceEh: EntryHashB64, sessionNames: string[]): Promise<Dictionary<PlacementSession>> {
    const index = this._manifests[spaceEh]? this._manifests[spaceEh].sessionEhs.length : 0;
    const ehs = await this.zomeProxy.createSessions(spaceEh, sessionNames);
    let sessions: any = {};
    for (let i = 0; i < sessionNames.length; i++) {
      const session = this.addSession(spaceEh, sessionNames[i], ehs[i], index + i)
      sessions[ehs[i]] = session;

    }
    this.notifySubscribers();
    return sessions;
  }


  /** -- Visibility -- */

  /** */
  async hidePlay(spaceEh: EntryHashB64) : Promise<void> {
    const _ = await this.zomeProxy.hideSpace(spaceEh);
    this._manifests[spaceEh].visible = false
    this.notifySubscribers();
  }

  /** */
  async unhidePlay(spaceEh: EntryHashB64): Promise<void> {
    const _ = await this.zomeProxy.unhideSpace(spaceEh);
    this._manifests[spaceEh].visible = true
    this.notifySubscribers();
  }


  /** -- Locations -- */

  /** */
  async publishLocation(location: WhereLocation, spaceEh: EntryHashB64) : Promise<ActionHashB64> {
    const session = await this.zomeProxy.getSessionFromEh(location.sessionEh);
    const linkAh = await this.publishLocationWithSessionIndex(location, spaceEh, session!.index)
    const locInfo: LocationInfo = { location, linkAh, authorPubKey: this.agentPubKey }
    this._sessions[location.sessionEh].locations.push(locInfo)
    this.notifySubscribers();
    return linkAh;
  }


  /** */
  private async publishLocationWithSessionIndex(location: WhereLocation, spaceEh: EntryHashB64, sessionIndex: number): Promise<ActionHashB64> {
    const entry = convertLocationToHere(location);
    const ah = this.zomeProxy.addHere(spaceEh, sessionIndex, entry.value, entry.meta);
    return ah;
  }


  /** */
  async updateLocation(sessionEh: EntryHashB64, spaceEh: EntryHashB64, locIdx: number, c: Coord, tag?: string, emoji?: string): Promise<LocationInfo> {
    const locInfo = this.getSession(sessionEh)!.locations[locIdx]!;
    locInfo.location.coord = c
    if (tag != null) {
      locInfo.location.meta.tag = tag
    }
    if (emoji != null) {
      locInfo.location.meta.emoji = emoji
    }
    const session = await this.zomeProxy.getSessionFromEh(sessionEh);
    const newLinkAh: ActionHashB64 = await this.publishLocationWithSessionIndex(locInfo.location, spaceEh, session!.index)
    await this.zomeProxy.deleteHere(locInfo.linkAh)
    locInfo.linkAh = newLinkAh;
    this._sessions[sessionEh].locations[locIdx] = locInfo;
    this.notifySubscribers();
    return locInfo;
  }


  /** */
  async deleteLocation(sessionEh: EntryHashB64, idx: number): Promise<LocationInfo> {
    const locInfo = this.getSession(sessionEh)!.locations[idx]!
    await this.zomeProxy.deleteHere(locInfo.linkAh)
    this._sessions[sessionEh].locations[idx] = null;
    this.notifySubscribers();
    return locInfo;
  }



}