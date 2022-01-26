import {contextProvided, ContextProvider} from "@lit-labs/context";
import { state } from "lit/decorators.js";
import {
  WhereController,
  WhereSpace,
  WhereStore,
  whereContext,
} from "@where/elements";
import {
  ProfilePrompt,
  ProfilesStore,
  profilesStoreContext,
} from "@holochain-open-dev/profiles";
import { AppWebsocket } from "@holochain/conductor-api";
import { HolochainClient } from "@holochain-open-dev/cell-client";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html } from "lit";
import * as base64 from "byte-base64";

let APP_ID = 'where'
let HC_PORT:any = process.env.HC_PORT;
let NETWORK_ID: any = null
export const IS_ELECTRON = (window.location.port === ""); // No HREF PORT when run by Electron
if (IS_ELECTRON) {
  APP_ID = 'main-app'
  let searchParams = new URLSearchParams(window.location.search);
  HC_PORT = searchParams.get("PORT");
  NETWORK_ID = searchParams.get("UID");
  console.log(NETWORK_ID)
}

// FIXME
//const HC_PORT = process.env.HC_PORT
//const HC_PORT = 8889
console.log("HC_PORT = " + HC_PORT + " || " + process.env.HC_PORT);


export class WhereApp extends ScopedElementsMixin(LitElement) {
  @state()
  loaded = false;

  async firstUpdated() {

    const appWebsocket = await AppWebsocket.connect(
      `ws://localhost:${HC_PORT}`
    );
    const installed_app_id = NETWORK_ID == null || NETWORK_ID == ''
      ? APP_ID
      : APP_ID + '-' + NETWORK_ID;
    console.log({installed_app_id})
    const appInfo = await appWebsocket.appInfo({
      installed_app_id,
    });
    //console.log({appInfo})
    const cellData = appInfo.cell_data[0];
    // Send dnaHash to electron
    if (IS_ELECTRON) {
      const ipc = window.require('electron').ipcRenderer;
      const dnaHash = base64.bytesToBase64(cellData.cell_id[0])
      let _reply = ipc.sendSync('dnaHash', dnaHash);
    }
    const cellClient = new HolochainClient(appWebsocket, cellData);

    const store = new ProfilesStore(cellClient, {avatarMode: "avatar"})

    store.fetchAllProfiles()

    new ContextProvider(
      this,
      profilesStoreContext,
      store
    );

    new ContextProvider(this, whereContext, new WhereStore(cellClient, store));

    this.loaded = true;
  }


  render() {
    if (!this.loaded) return html`<span>Loading...</span>`;
    return html`
<!--        <profile-prompt style="margin-left:-7px; margin-top:0px;display:block;">-->
<!--            <where-controller examples></where-controller>-->
<!--        </profile-prompt>-->
      <where-controller id="controller" dummy examples></where-controller>
    `;
  }

  static get scopedElements() {
    return {
      "profile-prompt": ProfilePrompt,
      "where-controller": WhereController,
    };
  }
}
