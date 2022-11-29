import { state } from "lit/decorators.js";
import { html } from "lit";
import {cellContext, ConductorAppProxy, HappElement, HappViewModel} from "@ddd-qc/dna-client";
import {setLocale, DEFAULT_LUDOTHEQUE_DEF, LudothequeDvm, LudothequePage} from "@where/elements";
import {msg} from "@lit/localize";
import {ContextProvider} from "@lit-labs/context";
import {AppWebsocket, InstalledAppId} from "@holochain/client";

/** Localization */

setLocale('fr-fr');


/** -- Globals -- */

let HC_APP_PORT: any = process.env.HC_APP_PORT;

/** override installed_app_id when in Electron */
export const IS_ELECTRON = (window.location.port === ""); // No HREF PORT when run by Electron
if (IS_ELECTRON) {
  let APP_ID = 'main-app'
  let searchParams = new URLSearchParams(window.location.search);
  HC_APP_PORT = searchParams.get("PORT");
  const NETWORK_ID = searchParams.get("UID");
  console.log(NETWORK_ID)
  DEFAULT_LUDOTHEQUE_DEF.id = APP_ID + '-' + NETWORK_ID;
}

console.log({APP_ID: DEFAULT_LUDOTHEQUE_DEF.id})
console.log({HC_APP_PORT})


/**
 *
 */
export class LudothequeStandaloneApp extends HappElement {

  /** Ctor */
  constructor(port_or_socket?: number | AppWebsocket, appId?: InstalledAppId) {
    super(port_or_socket? port_or_socket : HC_APP_PORT, appId);
  }

  static HVM_DEF = DEFAULT_LUDOTHEQUE_DEF;

  @state() private _loaded = false;


  /** QoL */
  get ludothequeDvm(): LudothequeDvm { return this.hvm.getDvm(LudothequeDvm.DEFAULT_ROLE_ID)! as LudothequeDvm }


  /** */
  async firstUpdated() {
    new ContextProvider(this, cellContext, this.ludothequeDvm.installedCell)
    /* Send dnaHash to electron */
    if (IS_ELECTRON) {
      const ludoDnaHashB64 = this.hvm.getDvm(LudothequeDvm.DEFAULT_ROLE_ID)!.dnaHash;
      const ipc = window.require('electron').ipcRenderer;
      let _reply = ipc.sendSync('dnaHash', ludoDnaHashB64);
    }
    /* Done */
    this._loaded = true;
  }


  /** */
  render() {
    console.log("<ludotheque-standalone-app> render()", this._loaded)
    if (!this._loaded) {
      return html`<span>${msg('Loading')}...</span>`;
    }
    return html`
      <ludotheque-page examples @import-playset-requested="${this.handleImportRequest}"></ludotheque-page>
    `;
  }


  /** */
  private async handleImportRequest(e: any) {
    console.log("handleImportRequest() : " + JSON.stringify(e.detail))
  }


  /** */
  static get scopedElements() {
    return {
      "ludotheque-page": LudothequePage,
    };
  }
}