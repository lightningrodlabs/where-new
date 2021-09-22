import { html, css, LitElement } from "lit";
import { state, query } from "lit/decorators.js";

import { sharedStyles } from "../sharedStyles";
import { contextProvided } from "@lit-labs/context";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { WhereStore } from "../where.store";
import {whereContext, Space, Coord, TemplateEntry} from "../types";
import {Dialog, TextField, Button, Checkbox, Formfield, Select, ListItem} from "@scoped-elements/material-web";
import {StoreSubscriber} from "lit-svelte-stores";
import {quadrant_template_svg} from "./templates";

/**
 * @element where-space
 */
export class WhereSpaceDialog extends ScopedElementsMixin(LitElement) {

  @state() size : Coord = {x:0,y:0};
  @state() _currentTemplate: TemplateEntry = {name: "__dummy", surface:""};
  @state() _currentPlaceHolders: Array<string> = [];

  /** Dependencies */
  @contextProvided({ context: whereContext })
  _store!: WhereStore;

  _templates = new StoreSubscriber(this, () => this._store.templates);

  open() {
    if (this._templates.value === undefined) {
      return;
    }
    const dialog = this.shadowRoot!.getElementById("space-dialog") as Dialog
    dialog.open = true
  }

  /** Private properties */
  @query('#name-field')
  _nameField!: TextField;
  @query('#template-field')
  _templateField!: Select;
  @query('#multi-chk')
  _multiChk!: Checkbox;
  // @query('#url-field')
  // _urlField!: TextField;
  // @query('#sfc')
  // _surfaceImg!: HTMLImageElement;


  private async handleOk(e: any) {
    // - Check validity
    const valid = this._nameField.validity.valid
    //&& this._urlField.validity.valid
    if (!this._nameField.validity.valid) {
      this._nameField.reportValidity()
    }
    // if (!this._urlField.validity.valid) {
    //   this._urlField.reportValidity()
    // }
    if (!valid) return

    // - Get checkbox value
    const chk = this.shadowRoot!.getElementById(
      "multi-chk"
    ) as Checkbox;
    const multi = chk.checked ? "true" : ""


    let surface = this.generateSurface();

    // - Create space
    console.log("this._templateField.value = " + this._templateField.value);
    const space: Space = {
      name: this._nameField.value,
      origin: this._templateField.value,
      surface,
      meta: {
        multi,
      },
      wheres: [],
    };
    // - Add space to commons
    const newSpace = await this._store.addSpace(space);
    this.dispatchEvent(new CustomEvent('space-added', { detail: newSpace, bubbles: true, composed: true }));
    // - Close dialog
    const dialog = this.shadowRoot!.getElementById("space-dialog") as Dialog;
    dialog.close()
  }

  private async handleSpaceDialog(e: any) {
    this._nameField.value = "";
    //this._urlField.value = "";
    //this._surfaceImg.src = "";
  }

  private handleTemplateSelect(templateName: string): void {
    this._currentTemplate = this._templates.value[templateName]
  }

  // handleUrlUpdated(e:Event) {
  //   this._urlField.setCustomValidity("can't load url")
  //   this._surfaceImg.onload = async () => {
  //     this._urlField.setCustomValidity("")
  //     this.size ={y:this._surfaceImg.naturalHeight, x: this._surfaceImg.naturalWidth}
  //   }
  //   this._surfaceImg.src = this._urlField.value;
  //   this.size = {x:0,y:0}
  // }

  // - Generate surface from template
  generateSurface() {
    //let surface: any = {html: `<img src="%%ImageUrl%%" style="width:100%" />`, size: { x: 626, y: 626 }, data: "[]"}
    //let surface: any = {svg: quadrant_template_svg, size: { x: 626, y: 626 }, data: "[]"}
    let surface: any = JSON.parse(this._currentTemplate.surface);
    let code: string = surface.svg? surface.svg : surface.html;

    //let surface = JSON.parse(this._templateField.value);

    // - Create substitution map
    let subMap: Map<string, string> = new Map();
    for (let placeholder of this._currentPlaceHolders) {
      const txtfield = this.shadowRoot!.getElementById(placeholder + "-gen") as TextField;
      subMap.set(placeholder, txtfield.value)
    }
    console.log({subMap})
    // - Replace each placeholder
    subMap.forEach((value, key, map) => {
      let pattern = "%%" + key + "%%"
      var regex = new RegExp(pattern, "g");
      code = code.replace(regex, value)
    })
    console.log({code})

    // - Replace field
    if (surface.svg) {
      surface.svg = code
    } else {
      surface.html = code
    }
    // - Add missing fields
    if (!surface.data) {
      surface.data = `[]`
    }
    if (!surface.size) {
      surface.size = { x: 600, y: 600 }
    }
    // Done
    return surface;
  }

  renderTemplate() {
    if (this._currentTemplate.surface === "") {
      return html``
    }

    let surface: any = JSON.parse(this._currentTemplate.surface);

    // -- Extract Fields -- //
    console.log({surface})
    // - Parse template
    const regex = /%%([a-zA-Z_0-9\-]+)%%/gm;
    let code = surface.svg? surface.svg : surface.html;
    let names: Set<string> = new Set()
    try {
      //let match = regex.exec(code);
      const match = [...code.matchAll(regex)];
      console.log({match})
      // - Remove duplicates
      for (const pair of match) {
        names.add(pair[1])
      }
      console.log({names})
    } catch(err) {
      console.error('No placeholder found in template');
    }
    this._currentPlaceHolders = Array.from(names)
    // - Generate textField for each placeholder
    return html`${this._currentPlaceHolders.map((name)=> html`<mwc-textfield id="${name}-gen" required label="${name}"></mwc-textfield>`)}`
  }


  render() {

    // <div id="thumbnail"><img id="sfc" src="" />${this.size.x} x ${this.size.y}</div>
    // <mwc-textfield @input=${this.handleUrlUpdated} id="url-field" label="Image URL" autoValidate=true required></mwc-textfield>

    let selectedTemplateUi = this.renderTemplate()
    console.log({selectedTemplateUi})

    return html`
<mwc-dialog  id="space-dialog" heading="Space" @closing=${this.handleSpaceDialog}>
  <mwc-textfield @input=${() => (this.shadowRoot!.getElementById("name-field") as TextField).reportValidity()}
                 id="name-field" minlength="3" maxlength="64" label="Name" autoValidate=true required></mwc-textfield>
  <mwc-select required id="template-field" label="Template" @select=${this.handleTemplateSelect}>
    ${Object.entries(this._templates.value).map(
      ([key, template]) => html`
    <mwc-list-item
      @request-selected=${() => this.handleTemplateSelect(key)}
      .selected=${key === this._currentTemplate.name}
      value="${key}"
      >${template.name}
    </mwc-list-item>
  `
    )}
  </mwc-select>
    ${selectedTemplateUi}
<mwc-formfield label="Multi-wheres per user">
<mwc-checkbox id="multi-chk"></mwc-checkbox>
</mwc-formfield>
<mwc-button id="primary-action-button" slot="primaryAction" @click=${this.handleOk}>ok</mwc-button>
<mwc-button slot="secondaryAction"  dialogAction="cancel">cancel</mwc-button>
</mwc-dialog>
`
  }
  static get scopedElements() {
    return {
      "mwc-select": Select,
      "mwc-list-item": ListItem,
      "mwc-button": Button,
      "mwc-dialog": Dialog,
      "mwc-textfield": TextField,
      "mwc-formfield": Formfield,
      "mwc-checkbox": Checkbox,
    };
  }
  static get styles() {
    return [
      sharedStyles,
      css`
        #template-field {
            display: block;
              width: 227px;
        }
        #thumbnail {
          padding-left: 10px;
          width: 200px;
          float: right;
        }
        #sfc {
          width: 100%;
        }
`,
    ];
  }
}
