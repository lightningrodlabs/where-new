import { html,css, LitElement } from 'lit';
import { state, property } from 'lit/decorators.js';

import { contextProvided } from "@lit-labs/context";
import { contextStore } from 'lit-svelte-stores';

import { sharedStyles } from '../sharedStyles';
import { whereContext, Where, Location, Space, Dictionary } from '../types';
import { WhereStore } from '../where.store';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { profilesStoreContext, ProfilesStore, Profile } from "@holochain-open-dev/profiles";

const MARKER_WIDTH = 40

/**
 * @element where-space
 */
export class WhereSpace extends ScopedElementsMixin(LitElement) {

  constructor() {
    super()
    this.addEventListener('wheel', this._handleWheel);
  }

  @property({ type: String }) avatar = '';
  @property({ type: String }) current = '';

  @contextProvided({context: whereContext})
  _store!: WhereStore;

  @contextProvided({context: profilesStoreContext})
  _profiles!: ProfilesStore;

  @contextStore({
    context: profilesStoreContext,
    selectStore: s => s.myProfile,
  })
  _myProfile!: Profile;

  @contextStore({
    context: whereContext,
    selectStore: s => s.spaces,
  })
  _spaces!: Dictionary<Space>;

  @contextStore({
    context: whereContext,
    selectStore: s => s.zooms,
  })
  _zooms!: Dictionary<number>;

  private _handleWheel = (e:WheelEvent) => {
    if (e.target) {
      e.preventDefault()
      this._store.zoom(this.current, e.deltaY > 0 ? .05 : -.05)
    }
  }

  zoom(delta: number) : void {
    this._store.zoom(this.current, delta)
  }

  get myNickName(): string {
    return this._myProfile.nickname
  }

  private handleClick(event: any) : void {
    if (event != null) {
      const rect = event.target.getBoundingClientRect();
      const z = this._zooms[this.current]
      const x = (event.clientX - rect.left)/z; //x position within the element.
      const y = (event.clientY - rect.top)/z;  //y position within the element.

      // For now we are assuming one where per agent keyed by the nickname
      const idx = this._store.getAgentIdx(this.current, this.myNickName )
      if (idx >= 0) {
        this._store.updateWhere(this.current, idx, x, y)
      } else {
        const where : Location = {
          location: {x,y},
          meta: {
            tag: "",
            img: this.avatar,
            name: this.myNickName
          }
        }
        this._store.addWhere(this.current, where )
      }
    }
  }

  render() {
    if (!this.current) return
    const space = this._spaces[this.current]
    const z = this._zooms[this.current]
    const whereItems = space.wheres.map((where, i) => {

      const x = where.entry.location.x*z
      const y = where.entry.location.y*z

      return html`
<img idx="${i}" class="where-marker ${where.entry.meta.name == this.myNickName ? "me": ""}" style="left:${x}px;top: ${y}px" src="${where.entry.meta.img}">
<div class="where-details ${where.entry.meta.name == this.myNickName ? "me": ""}"  style="left:${x}px;top: ${y}px" src="${where.entry.meta.img}">
<h3>${where.entry.meta.name}</h3>
<p>${where.entry.meta.tag}</p>
`})

    return html`
<div class="surface">
<img .style="width:${space.surface.size.x*z}px" .id="${this.current}-img" src="${space.surface.url}" @click=${this.handleClick}>
${whereItems}
</div>
`
  }

  static get styles() {
    return [
      sharedStyles,
      css`
.surface{
position: relative;
overflow:auto;
max-width:1500px;
max-height:900px;
}

.surface > img {
}

img.where-marker {
max-width:100%;
max-height:100%;
border-radius: 10000px;
border: black 1px solid;
position: absolute;
height: ${MARKER_WIDTH}px;
width: ${MARKER_WIDTH}px;
margin-top: -${MARKER_WIDTH/2}px;
margin-left: -${MARKER_WIDTH/2}px;
}

img.where-marker.me {
border: orange 2px solid;
}

.where-details {
display: none;
position: absolute;

background: white;
border-radius: 10px;
border: black 1px solid;
padding: 15px;
text-align: left;
}

.where-details.me {
border: orange 2px solid;
}

.where-details h3 {
margin: 0;
}

.where-details p:last-of-type {
margin-bottom: 0;
}

.where-marker:hover + .where-details, .where-details:hover {
display: block;
}
`]
  }
}
