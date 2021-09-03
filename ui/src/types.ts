// TODO: add globally available interfaces for your elements

import { AgentPubKeyB64, EntryHashB64 } from "@holochain-open-dev/core-types";

export const WHERE_CONTEXT = 'hc_zome_where/service';

export type Dictionary<T> = { [key: string]: T };

export interface WhereInfo {
  entry: WhereEntry,
  author: AgentPubKeyB64,
}

export interface WhereEntry {
  location: string;
  meta: Dictionary<string>;
}

export interface Where {
  entry: Location;
  authorPubkey: AgentPubKeyB64;
}

export interface Location {
  location: Coord;
  meta: Dictionary<string>;
}

export interface Coord {
  x: number;
  y: number;
}

export interface Surface {
  url: string;
  size: Coord;
}

export interface SpaceEntry {
  name: string;
  surface: string;
  meta?: Dictionary<string>;
}

export interface Space  {
  name: string;
  surface: Surface;
  wheres: Where[];
  meta?: Dictionary<string>;
}

export interface CalendarEvent {
  title: string;
  createdBy: AgentPubKeyB64;
  startTime: number;
  endTime: number;
  invitees: AgentPubKeyB64[];
  location: string;
}
