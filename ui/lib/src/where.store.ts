import {EntryHashB64, HeaderHashB64, AgentPubKeyB64, serializeHash, HoloHashed} from '@holochain-open-dev/core-types';
import { CellClient } from '@holochain-open-dev/cell-client';
import { writable, Writable, derived, Readable, get } from 'svelte/store';

import { WhereService, locationFromHere, hereFromLocation } from './where.service';
import {
  Dictionary,
  Play,
  SpaceEntry,
  LocationInfo,
  Location,
  Coord,
  TemplateEntry, Signal, EmojiGroupEntry, SvgMarkerEntry, PlayMeta, PlacementSession, defaultPlayMeta, Space,
} from './types';
import {
  ProfilesStore,
} from "@holochain-open-dev/profiles";

const areEqual = (first: Uint8Array, second: Uint8Array) =>
      first.length === second.length && first.every((value, index) => value === second[index]);

export class WhereStore {
  /** Private */
  private service : WhereService
  private profiles: ProfilesStore

  /** SvgMarkerEh -> SvgMarker */
  private svgMarkerStore: Writable<Dictionary<SvgMarkerEntry>> = writable({});
  /** EmojiGroupEh -> EmojiGroup */
  private emojiGroupStore: Writable<Dictionary<EmojiGroupEntry>> = writable({});
  /** TemplateEh -> Template */
  private templateStore: Writable<Dictionary<TemplateEntry>> = writable({});
  /** SpaceEh -> Play */
  private playStore: Writable<Dictionary<Play>> = writable({});
  /** SpaceEh -> zoomPct */
  private zoomStore: Writable<Dictionary<number>> = writable({});
  /** SpaceEh -> sessionEh */
  private currentSessionStore: Writable<Dictionary<EntryHashB64>> = writable({});
  /** agentPubKey -> timestamp */
  private agentPresenceStore: Writable<Dictionary<number>> = writable({});

  /** Static info */
  myAgentPubKey: AgentPubKeyB64;

  /** Readable stores */
  public svgMarkers: Readable<Dictionary<SvgMarkerEntry>> = derived(this.svgMarkerStore, i => i)
  public emojiGroups: Readable<Dictionary<EmojiGroupEntry>> = derived(this.emojiGroupStore, i => i)
  public templates: Readable<Dictionary<TemplateEntry>> = derived(this.templateStore, i => i)
  public plays: Readable<Dictionary<Play>> = derived(this.playStore, i => i)
  public zooms: Readable<Dictionary<number>> = derived(this.zoomStore, i => i)
  public agentPresences: Readable<Dictionary<number>> = derived(this.agentPresenceStore, i => i)
  public currentSessions: Readable<Dictionary<EntryHashB64>> = derived(this.currentSessionStore, i => i)


  constructor(
    protected cellClient: CellClient,
    profilesStore: ProfilesStore,
    zomeName: string = 'hc_zome_where')
  {
    this.myAgentPubKey = serializeHash(cellClient.cellId[1]);
    this.profiles = profilesStore;
    this.service = new WhereService(cellClient, zomeName);

    cellClient.addSignalHandler( signal => {
      if (! areEqual(cellClient.cellId[0],signal.data.cellId[0]) || !areEqual(cellClient.cellId[1], signal.data.cellId[1])) {
        return
      }
      //console.debug("SIGNAL", signal)
      const payload = signal.data.payload
      // Update agent's presence stat
      this.updatePresence(payload.from)
      // Send pong response
      if (payload.message.type != "Pong") {
        //console.log("PONGING ", payload.from)
        const pong: Signal = {
          maybeSpaceHash: payload.maybeSpaceHash,
          from: this.myAgentPubKey,
          message: {type: 'Pong', content: this.myAgentPubKey}
        };
        this.service.notify(pong, [payload.from])
      }
      // Handle signal
      switch(payload.message.type) {
        case "Ping":
        case "Pong":
          break;
        case "NewSvgMarker":
          const svgEh = payload.message.content[0]
          if (!get(this.svgMarkers)[svgEh]) {
            this.svgMarkerStore.update(store => {
              store[svgEh] = payload.message.content[1]
              return store
            })
          }
          break;
        case "NewEmojiGroup":
          const groupEh = payload.message.content[0]
          if (!get(this.emojiGroups)[groupEh]) {
            this.emojiGroupStore.update(emojiGroups => {
              emojiGroups[groupEh] = payload.message.content[1]
              return emojiGroups
            })
          }
          break;
      case "NewTemplate":
        const templateEh = payload.message.content[0]
        if (!get(this.templates)[templateEh]) {
          this.templateStore.update(templates => {
            templates[templateEh] = payload.message.content[1]
            return templates
          })
        }
        break;
      case "NewSpace":
        const spaceEh = payload.message.content[0]
        if (!get(this.plays)[spaceEh]) {
          console.log("addPlay() from signal: " + spaceEh)
          this.addPlay(spaceEh)
        }
        break;
      case "NewHere":
        const hereInfo = payload.message.content;
        if (payload.maybeSpaceHash && get(this.plays)[payload.maybeSpaceHash]) {
          this.playStore.update(plays => {
            let locations = plays[payload.maybeSpaceHash].sessions[hereInfo.entry.sessionEh].locations
            const w : LocationInfo = locationFromHere(hereInfo)
            const idx = locations.findIndex((locationInfo) => locationInfo!.hh == payload.message.hh)
            if (idx > -1) {
              locations[idx] = w
            } else {
              locations.push(w)
            }
            return plays
          })
        }
        break;
      case "DeleteHere":
        const sessionEh = payload.message.content[0];
        const hereHh = payload.message.content[1];
        if (payload.maybeSpaceHash && get(this.plays)[payload.maybeSpaceHash]) {
          this.playStore.update(plays => {
            let locations = plays[payload.maybeSpaceHash].sessions[sessionEh].locations
            const idx = locations.findIndex((locationInfo) => locationInfo && locationInfo.hh == hereHh)
            if (idx > -1) {
              locations.splice(idx, 1);
            }
            return plays
          })
        }
        break;
      }
    })

  }

  pingOthers(spaceHash: EntryHashB64, myKey: AgentPubKeyB64) {
    const ping: Signal = {maybeSpaceHash: spaceHash, from: this.myAgentPubKey, message: {type: 'Ping', content: myKey}};
    // console.log({signal})
    this.service.notify(ping, this.others());
  }

  private others(): Array<AgentPubKeyB64> {
    return Object.keys(get(this.profiles.knownProfiles)).filter((key)=> key != this.myAgentPubKey)
  }

  private updatePresence(from: AgentPubKeyB64) {
    const currentTimeInSeconds: number = Math.floor(Date.now() / 1000);
    this.agentPresenceStore.update(agentPresences => {
      agentPresences[from] = currentTimeInSeconds;
      return agentPresences;
    })
    return from;
  }

  updateCurrentSession(spaceEh: EntryHashB64, sessionEh: EntryHashB64) {
    this.currentSessionStore.update(currentSessions => {
      currentSessions[spaceEh] = sessionEh;
      //console.log(" - updated current session for: " + spaceEh)
      //console.log({sessionEh})
      return currentSessions;
    })
  }

  private async addPlay(spaceEh: EntryHashB64): Promise<void>   {
    // - Construct Play and add it to store
    const play: Play = await this.getPlay(spaceEh)
    this.playStore.update(plays => {
      plays[spaceEh] = play
      console.log({play})
      return plays
    })
    // - Set starting zoom for new Play
    if (!get(this.zoomStore)[spaceEh]) {
      this.zoomStore.update(zooms => {
        zooms[spaceEh] = 1.0
        return zooms
      })
    }
    // - Set currentSession for new Play
    const firstSessionEh = await this.service.getSessionHash(spaceEh, 0);
    // console.log("addPlay() firstSessionEh: " + firstSessionEh)
    if (firstSessionEh) {
      this.updateCurrentSession(spaceEh, firstSessionEh)
    } else {
      console.error("No session found for Play " + play.space.name)
    }
  }

  async addTemplate(template: TemplateEntry) : Promise<EntryHashB64> {
    const eh64: EntryHashB64 = await this.service.createTemplate(template)
    this.templateStore.update(templates => {
      templates[eh64] = template
      return templates
    })
    this.service.notify(
      {maybeSpaceHash: null, from: this.myAgentPubKey, message: {type:"NewTemplate", content:[eh64, template]}}
      , this.others());
    return eh64
  }

  async updatePlays() : Promise<Dictionary<Play>> {
    const spaces = await this.service.getSpaces();
    //const hiddens = await this.service.getHiddenSpaceList();
    //console.log({hiddens})
    for (const space of spaces.values()) {
      //const visible = !hiddens.includes(space.hash)
      await this.addPlay(space.hash)
    }
    return get(this.playStore)
  }

  async updateTemplates() : Promise<Dictionary<TemplateEntry>> {
    const templates = await this.service.getTemplates();
    for (const t of templates) {
      this.templateStore.update(templateStore => {
        templateStore[t.hash] = t.content
        return templateStore
      })
    }
    return get(this.templateStore)
  }

  async updateSvgMarkers() : Promise<Dictionary<SvgMarkerEntry>> {
    const markers = await this.service.getSvgMarkers();
    for (const e of markers) {
      this.svgMarkerStore.update(svgMarkers => {
        svgMarkers[e.hash] = e.content
        return svgMarkers
      })
    }
    return get(this.svgMarkerStore)
  }

  async updateEmojiGroups() : Promise<Dictionary<EmojiGroupEntry>> {
    const groups = await this.service.getEmojiGroups();
    for (const e of groups) {
      this.emojiGroupStore.update(emojiGroups => {
        emojiGroups[e.hash] = e.content
        return emojiGroups
      })
    }
    return get(this.emojiGroupStore)
  }

  async addEmojiGroup(emojiGroup: EmojiGroupEntry) : Promise<EntryHashB64> {
    const eh64: EntryHashB64 = await this.service.createEmojiGroup(emojiGroup)
    this.emojiGroupStore.update(emojiGroups => {
      emojiGroups[eh64] = emojiGroup
      return emojiGroups
    })
    this.service.notify(
      {maybeSpaceHash: null, from: this.myAgentPubKey, message: {type:"NewEmojiGroup", content: [eh64, emojiGroup]}}
      , this.others());
    return eh64
  }

  async addSvgMarker(svgMarker: SvgMarkerEntry) : Promise<EntryHashB64> {
    const eh64: EntryHashB64 = await this.service.createSvgMarker(svgMarker)
    this.svgMarkerStore.update(svgMarkers => {
      svgMarkers[eh64] = svgMarker
      return svgMarkers
    })
    this.service.notify(
      {maybeSpaceHash: null, from: this.myAgentPubKey, message: {type:"NewSvgMarker", content:[eh64, svgMarker]}}
      , this.others());
    return eh64
  }

  /** Get latest entries of each type and update local store accordingly */
  async pullDht() {
    const svgMarkers = await this.updateSvgMarkers();
    const emojiGroups = await this.updateEmojiGroups();
    const templates = await this.updateTemplates();
    const spaces = await this.updatePlays();
    console.log(`Entries found: ${Object.keys(spaces).length} | ${Object.keys(templates).length} | ${Object.keys(emojiGroups).length} | ${Object.keys(svgMarkers).length}`)
    //console.log({plays})
  }

  /**
   * Construct Play from all related DNA entries
   * @param spaceEh
   */
  async getPlay(spaceEh: EntryHashB64): Promise<Play> {
    // - Space
    const spaceEntry = await this.service.getSpace(spaceEh)
    if (!spaceEntry) {
      console.error("Play not found")
      return Promise.reject("Play not found")
    }
    // - Sessions
    const sessionEhs = await this.service.getAllSessions(spaceEh);
    let sessions: Dictionary<PlacementSession> = {};
    for (const sessionEh of sessionEhs) {
      const session = await this.service.sessionFromEntry(sessionEh);
      // - Heres
      const locations = await this.service.getLocations(sessionEh);
      session.locations = locations;
      Object.assign(sessions, {[sessionEh]: session})
    }
    // - Visible
    const visible = await this.service.isSpaceVisible(spaceEh);
    // - Done
    return {
      space: this.service.spaceFromEntry(spaceEntry),
      visible,
      sessions,
    } as Play;
  }

  /**
   * Create new empty play with starting space
   * Creates a default "global" session
   */
  async newPlay(space: Space, sessionNamesArray?: string[]): Promise<EntryHashB64> {
    let sessionNames = ["global"];
    if (sessionNamesArray && sessionNamesArray.length > 0 && sessionNamesArray[0] != "") {
      sessionNames = sessionNamesArray
    }
    // - Create and commit SpaceEntry
    const entry = this.service.spaceIntoEntry(space);
    const spaceEh: EntryHashB64 = await this.service.createSpaceWithSessions(entry, sessionNames)
    // - Notify others
    const newSpace: Signal = {maybeSpaceHash: spaceEh, from: this.myAgentPubKey, message: {type: 'NewSpace', content: entry}};
    this.service.notify(newSpace, this.others());
    // - Add play to store
    console.log("newPlay(): " + space.name + " | " + spaceEh)
    this.addPlay(spaceEh);
    // Done
    return spaceEh;
  }

  async hidePlay(spaceEh: EntryHashB64) : Promise<boolean> {
    const _hh = await this.service.hideSpace(spaceEh);
    this.playStore.update(plays => {
      plays[spaceEh].visible = false
      return plays
    })
    return true;
  }

  async unhidePlay(spaceEh: EntryHashB64) : Promise<boolean> {
    const _hh = await this.service.unhideSpace(spaceEh);
    this.playStore.update(plays => {
      plays[spaceEh].visible = true
      return plays
    })
    return true;
  }


  async addLocation(spaceEh: EntryHashB64, location: Location) : Promise<void> {
    const hh = await this.service.addLocation(location, spaceEh, 0)
    const locInfo: LocationInfo = { location, hh, authorPubKey: this.myAgentPubKey }
    this.playStore.update(spaces => {
      spaces[spaceEh].sessions[location.sessionEh].locations.push(locInfo)
      return spaces
    })
    // Notify peers
    const entry = hereFromLocation(location)
    this.service.notify({
      maybeSpaceHash: spaceEh,
      from: this.myAgentPubKey,
      message: {
        type: "NewHere",
        content: {entry, hh, author: this.myAgentPubKey}
      }}
      , this.others());
  }


  async deleteAllMyLocations(spaceEh: EntryHashB64) {
    const space = get(this.playStore)[spaceEh];
    const sessionEh = get(this.currentSessionStore)[spaceEh];
    let idx = 0;
    for (const locInfo of space.sessions[sessionEh].locations) {
      if (locInfo && locInfo.authorPubKey === this.myAgentPubKey) {
        await this.deleteLocation(spaceEh, idx);
      }
      idx += 1;
    }
  }


  async deleteLocation(spaceEh: EntryHashB64, idx: number) {
    const space = get(this.playStore)[spaceEh]
    const sessionEh = get(this.currentSessionStore)[spaceEh];
    const locInfo = space.sessions[sessionEh].locations[idx]!
    await this.service.deleteLocation(locInfo.hh)
    this.playStore.update(spaces => {
      spaces[spaceEh].sessions[sessionEh].locations[idx] = null
      return spaces
    })
    await this.service.notify({
        maybeSpaceHash: spaceEh,
        from: this.myAgentPubKey,
        message: {type: "DeleteHere", content: [locInfo.location.sessionEh, locInfo.hh]
        }},
      this.others());
  }


  async updateLocation(spaceEh: EntryHashB64, idx: number, c: Coord, tag?: string, emoji?: string) {
    const space = get(this.playStore)[spaceEh]
    const sessionEh = get(this.currentSessionStore)[spaceEh];
    const locInfo = space.sessions[sessionEh].locations[idx]!
    locInfo.location.coord = c
    if (tag != null) {
      locInfo.location.meta.tag = tag
    }
    if (emoji != null) {
      locInfo.location.meta.emoji = emoji
    }
    const newHh: HeaderHashB64 = await this.service.addLocation(locInfo.location, spaceEh, 0)
    await this.service.deleteLocation(locInfo.hh)
    const oldHereHh = locInfo.hh;
    locInfo.hh = newHh;
    const oldSessionEh = locInfo.location.sessionEh;
    this.playStore.update(spaces => {
      spaces[spaceEh].sessions[sessionEh].locations[idx] = locInfo
      return spaces
    })
    const entry = hereFromLocation(locInfo.location)
    await this.service.notify({maybeSpaceHash: spaceEh, from: this.myAgentPubKey, message: {type: "DeleteHere", content: [oldSessionEh, oldHereHh]}}, this.others());
    await this.service.notify({maybeSpaceHash: spaceEh, from: this.myAgentPubKey, message: {type: "NewHere", content: {entry, hh: newHh, author: this.myAgentPubKey}}}, this.others());
  }

  getAgentIdx(spaceEh: EntryHashB64, agent: string) : number {
    const sessionEh = get(this.currentSessionStore)[spaceEh];
    return get(this.playStore)[spaceEh].sessions[sessionEh].locations.findIndex((locInfo) => locInfo && locInfo.location.meta.name == agent)
  }

  template(templateEh64: EntryHashB64): TemplateEntry {
      return get(this.templateStore)[templateEh64];
  }

  play(spaceEh: EntryHashB64): Play {
    return get(this.playStore)[spaceEh];
  }

  currentSession(spaceEh: EntryHashB64): EntryHashB64 {
    return get(this.currentSessionStore)[spaceEh];
  }

  zoom(spaceEh: EntryHashB64) : number {
    return get(this.zoomStore)[spaceEh]
  }

  updateZoom(spaceEh: EntryHashB64, delta: number) : void {
    this.zoomStore.update(zooms => {
      if (zooms[spaceEh] + delta < 0.1) {
        zooms[spaceEh] = 0.1
      } else {
        zooms[spaceEh] += delta;
      }
      return zooms
    })
  }
}
