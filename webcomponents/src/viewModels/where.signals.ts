import {ActionHashB64, AgentPubKeyB64, EntryHashB64} from "@holochain-open-dev/core-types";
import {Here, HereOutput, PlacementSession} from "./where.bindings";

export type WhereSignal = {
  maybeSpaceHash: EntryHashB64 | null,
  from: AgentPubKeyB64,
  message: WhereSignalMessage,
}


export type WhereSignalMessage =
  | {type: "Ping", content: AgentPubKeyB64}
  | {type: "Pong", content: AgentPubKeyB64}
  | {type: "NewHere", content:  HereOutput}
  | {type: "DeleteHere", content: [EntryHashB64, ActionHashB64]}
  | {type: "UpdateHere", content: [number, ActionHashB64, Here]}
  | {type: "NewSession", content: [EntryHashB64, PlacementSession]}
  | {type: "NewSpace", content: EntryHashB64}
  | {type: "NewTemplate", content: EntryHashB64}
  | {type: "NewEmojiGroup", content: EntryHashB64}
  | {type: "NewSvgMarker", content: EntryHashB64}

