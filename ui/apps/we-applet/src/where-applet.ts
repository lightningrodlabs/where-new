import { contextProvider, ContextProvider } from "@lit-labs/context";
import { property, state } from "lit/decorators.js";
import {
  ProfilesStore,
  profilesStoreContext,
} from "@holochain-open-dev/profiles";
import {HolochainClient, CellClient } from '@holochain-open-dev/cell-client';
import { whereContext, WhereService, WhereStore } from "@where/elements";
import { InstalledAppInfo, AppWebsocket, InstalledCell } from "@holochain/client";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { CircularProgress } from "@scoped-elements/material-web";
import { LitElement, html, css } from "lit";

export class WhereApplet extends ScopedElementsMixin(LitElement) {
  @property()
  appWebsocket!: AppWebsocket;

  @contextProvider({ context: profilesStoreContext })
  @property()
  profilesStore!: ProfilesStore;

  @property()
  appletAppInfo!: InstalledAppInfo;

  @state()
  loaded = false;

  async firstUpdated() {
    new ContextProvider(this, profilesStoreContext, this.profilesStore);


    const hcClient = new HolochainClient(this.appWebsocket);

    const appInfo = await this.appWebsocket.appInfo({
      installed_app_id: 'where',
    });

    const installedCells = appInfo.cell_data;
    const whereCell = installedCells.find(
      c => c.role_id === 'where'
    ) as InstalledCell;

    if (!whereCell) {
      alert("Where Cell not found in happ")
    }

    const whereClient = new CellClient(hcClient, whereCell);
    new ContextProvider(this, whereContext, new WhereStore(whereClient, this.profilesStore));
    // TODO: Initialize any store that you have and create a ContextProvider for it
    //
    // eg:
    // new ContextProvider(this, whereContext, new WhereStore(cellClient, store));

    this.loaded = true;
  }

  render() {
    if (!this.loaded)
      return html`<div
        style="display: flex; flex: 1; flex-direction: row; align-items: center; justify-content: center"
      >
        <mwc-circular-progress></mwc-circular-progress>
      </div>`;

    // TODO: add any elements that you have in your applet
    return html`<span>This is my applet!</span>`;
  }

  static get scopedElements() {
    return {
      "mwc-circular-progress": CircularProgress,
      // TODO: add any elements that you have in your applet
    };
  }

  static styles = [
    css`
      :host {
        display: flex;
        flex: 1;
      }
    `,
  ];
}
