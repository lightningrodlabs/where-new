import {css, html, LitElement, svg} from "lit";
import {property, query, state} from "lit/decorators.js";

import {sharedStyles} from "../sharedStyles";
import {contextProvided} from "@lit-labs/context";
import {ScopedElementsMixin} from "@open-wc/scoped-elements";
import {WhereStore} from "../where.store";
import {
  defaultPlayMeta,
  Dictionary,
  MarkerType,
  PlayMeta,
  TemplateEntry,
  UiItem,
  whereContext
} from "../types";
import {EMOJI_WIDTH, renderMarker, renderSvgMarker, renderUiItems} from "../sharedRender";
import {
  Button,
  Checkbox,
  Dialog,
  Formfield, IconButton,
  ListItem, Radio,
  Select,
  TextArea,
  TextField
} from "@scoped-elements/material-web";
import {StoreSubscriber} from "lit-svelte-stores";
import {unsafeHTML} from "lit/directives/unsafe-html.js";
import {unsafeSVG} from "lit/directives/unsafe-svg.js";
import {EntryHashB64} from "@holochain-open-dev/core-types";
import {Profile} from "@holochain-open-dev/profiles";
import {SlAvatar} from "@scoped-elements/shoelace";
import {prefix_canvas} from "../templates";
import {WhereEmojiGroupDialog} from "./where-emoji-group-dialog";
import {Picker} from "emoji-picker-element";
import {WhereSvgMarkerDialog} from "./where-svg-marker-dialog";


/**
 * @element where-space-dialog
 */
export class WhereSpaceDialog extends ScopedElementsMixin(LitElement) {

  /** Public properties */
  @property() myProfile: Profile| undefined = undefined;

  /** Dependencies */
  @contextProvided({ context: whereContext })
  _store!: WhereStore;
  _templates = new StoreSubscriber(this, () => this._store.templates);
  _emojiGroups = new StoreSubscriber(this, () => this._store.emojiGroups);
  _svgMarkers = new StoreSubscriber(this, () => this._store.svgMarkers);

  /** Private properties */
  @state() _currentTemplate: null | TemplateEntry = null;

  @state() _currentPlaceHolders: Array<string> = [];

  @state() _currentMeta: PlayMeta = defaultPlayMeta();

  _spaceToPreload?: EntryHashB64;
  _useTemplateSize: boolean = true // have size fields set to default only when changing template
  _canvas: string = "";


  @query('#name-field')
  _nameField!: TextField;
  // - Surface
  @query('#template-field')
  _templateField!: Select;
  @query('#width-field')
  _widthField!: TextField;
  @query('#height-field')
  _heightField!: TextField;
  @query('#ui-field')
  _uiField!: TextArea;
  // - Marker
  @query('#marker-select')
  _markerTypeField!: Select;
  @query('#multi-chk')
  _multiChk!: Checkbox;
  // - Tag
  @query('#tag-chk')
  _tagChk!: Checkbox;
  @query('#tag-visible-chk')
  _tagVisibleChk!: Checkbox;
  @query('#tag-as-marker-chk')
  _tagAsMarkerChk!: Checkbox;
  @query('#predefined-tags-field')
  _predefinedTagsField!: TextField;
  // - Slider
  @query('#can-slider-chk')
  _canSliderChk!: Checkbox;
  @query('#slider-axis-label-field')
  _sliderAxisLabelField!: TextField;
  @query('#stop-count-field')
  _stopCountField!: TextField;
  @query('#can-modify-past-chk')
  _canModifyPastChk!: Checkbox;
  @query('#stop-labels-field')
  _stopLabelsField!: TextField;

  get emojiGroupDialogElem() : WhereEmojiGroupDialog {
    return this.shadowRoot!.getElementById("emoji-group-dialog") as WhereEmojiGroupDialog;
  }

  get svgMarkerDialogElem() : WhereSvgMarkerDialog {
    return this.shadowRoot!.getElementById("svg-marker-dialog") as WhereSvgMarkerDialog;
  }

  get fixedStopRadioElem() : Radio {
    return this.shadowRoot!.getElementById("fixed-stop-radio") as Radio;
  }

  get generativeStopRadioElem() : Radio {
    return this.shadowRoot!.getElementById("generative-stop-radio") as Radio;
  }


  /**
   *
   */
  open(spaceToPreload?: EntryHashB64) {
    this._spaceToPreload = spaceToPreload;
    if (this._templates.value === undefined) {
      return;
    }
    this.requestUpdate();
    const dialog = this.shadowRoot!.getElementById("space-dialog") as Dialog
    dialog.open = true
  }

  /**
   *
   */
  loadPreset(spaceEh: EntryHashB64) {
    const originalPlay = this._store.play(spaceEh);
    if (!originalPlay) {
      return;
    }
    console.log("loading preset: " + originalPlay.space.name)
    this._currentMeta = { ...originalPlay.space.meta };

    this._nameField.value = 'Fork of ' + originalPlay.space.name;
    this._templateField.value = originalPlay.space.origin;
    this._widthField.value = originalPlay.space.surface.size.x;
    this._heightField.value = originalPlay.space.surface.size.y;
    this._uiField.value = originalPlay.space.meta.ui ? JSON.stringify(originalPlay.space.meta!.ui) : "[\n]";
    // - Markers
    this._markerTypeField.value = MarkerType[originalPlay.space.meta.markerType];
    this._multiChk.checked = originalPlay.space.meta.multi;
    // - Tags
    this._tagChk.checked = originalPlay.space.meta.canTag;
    this._tagVisibleChk.disabled = !originalPlay.space.meta.canTag;
    this._tagVisibleChk.checked = originalPlay.space.meta.tagVisible;
    this._tagAsMarkerChk.disabled = !originalPlay.space.meta.tagVisible;
    this._tagAsMarkerChk.checked = originalPlay.space.meta.tagAsMarker;
    this._predefinedTagsField.disabled = !originalPlay.space.meta.canTag;
    this._predefinedTagsField.value = originalPlay.space.meta.predefinedTags.join();
    // - Slider
    this._canSliderChk.checked = originalPlay.space.meta.canSlider;
    this._sliderAxisLabelField.value = originalPlay.space.meta.sliderAxisLabel;
    this.fixedStopRadioElem.disabled = !originalPlay.space.meta.canSlider;
    this.generativeStopRadioElem.disabled = !originalPlay.space.meta.canSlider;
    this.fixedStopRadioElem.checked = originalPlay.space.meta.stopCount > 0;
    this.generativeStopRadioElem.checked = originalPlay.space.meta.stopCount < 0;
    this._stopCountField.value = originalPlay.space.meta.stopCount.toString();
    this._stopLabelsField.value = originalPlay.space.meta.stopLabels.join();
    this._stopCountField.disabled = !originalPlay.space.meta.canSlider || !this.fixedStopRadioElem.checked;
    this._stopLabelsField.disabled = !originalPlay.space.meta.canSlider || !this.fixedStopRadioElem.checked;
    this._canModifyPastChk.checked = originalPlay.space.meta.canModifyPast;
    this._canModifyPastChk.disabled = !originalPlay.space.meta.canSlider || !this.generativeStopRadioElem.checked;

    /** Templated fields */
    for (let [key, value] of originalPlay.space.meta.subMap!) {
      let field = this.shadowRoot!.getElementById(key + '-gen') as TextField;
      if (!field) {
        console.log('Textfield not found: ' + key + '-gen')
        continue;
      }
      // console.log('field ' + key + ' - ' + value)
      field.value = value
      field.label = key
    }
  }

  private determineMarkerType(): string {
    if (!this._markerTypeField) {
      return MarkerType[MarkerType.Avatar];
    }
    return this._markerTypeField.value;
  }


  updated(changedProperties: any) {
    //console.log("Updated space-dialog: " + changedProperties)
    /** Execute Canvas code */
    if (this._canvas) {
      let canvas_code = prefix_canvas('preview-canvas') + this._canvas;
      try {
        var renderCanvas = new Function(canvas_code);
        renderCanvas.apply(this);
      } catch (e) {console.log("render canvas failed");}
    }
    /** Setup emoji picker */
    let emojiPickerElem = this.shadowRoot!.getElementById("emoji-picker") as Picker;
    if (emojiPickerElem) {
      emojiPickerElem.addEventListener('emoji-click', (event: any) => {
        const unicode = event?.detail?.unicode
        //console.log("emoji-click: " + unicode)
        let emojiPreview = this.shadowRoot!.getElementById("space-unicodes");
        emojiPreview!.innerHTML = unicode
        this._currentMeta.singleEmoji = unicode
        this.requestUpdate()
      });
    }
  }

  /**
   *
   */
  private async handleOk(e: any) {
    /** Check validity */
    // nameField
    let isValid = this._nameField.validity.valid
    isValid &&= this._widthField.validity.valid
    isValid &&= this._heightField.validity.valid

    if (!this._nameField.validity.valid) {
      this._nameField.reportValidity()
    }
    // width & height fields
    if (!this._widthField.validity.valid) {
      this._widthField.reportValidity()
    }
    if (!this._heightField.validity.valid) {
      this._heightField.reportValidity()
    }
    // uiField
    let ui: UiItem[] = [];
    try {
      ui = JSON.parse(this._uiField.value)
    }
    catch(e) {
      isValid = false;
      this._uiField.setCustomValidity("Invalid UI Object: " + e)
      this._uiField.reportValidity()
    }
    // Slider
    if (this._canSliderChk.checked) {
      isValid &&= this._sliderAxisLabelField.validity.valid
      if (!this._sliderAxisLabelField.validity.valid) {
        this._sliderAxisLabelField.reportValidity()
      }
      const isRadioChecked = this.fixedStopRadioElem.checked || this.generativeStopRadioElem.checked
      isValid &&= isRadioChecked
      if (!isRadioChecked) {
        this._stopLabelsField.setCustomValidity("Stops type not selected")
        this._stopLabelsField.reportValidity()
      }
      if (this.fixedStopRadioElem.checked) {
        isValid &&= this._stopCountField.validity.valid;
        if (!this._stopCountField.validity.valid) {
          this._stopCountField.reportValidity()
        }
        // check stop label validity (must be empty or have correct number of labels)
        if (this._stopLabelsField.value != "") {
          const strs = this._stopLabelsField.value.split(",");
          const isStopLabelsValid = strs.length == parseInt(this._stopCountField.value);
          isValid &&= isStopLabelsValid
          if (!isStopLabelsValid) {
            this._stopLabelsField.setCustomValidity("Label count mismatch")
            this._stopLabelsField.reportValidity()
          }
        }
      }
    }
    // Finish Validation
    if (!isValid) return

    /** Generate PlayMeta */
    const singleEmojiElem = this.shadowRoot!.getElementById("space-unicodes");
    let {surface, subMap} = this.generateSurface();
    // - Misc.
    this._currentMeta.ui = ui
    this._currentMeta.subMap = subMap
    // - Marker
    this._currentMeta.markerType = MarkerType[this.determineMarkerType() as keyof typeof MarkerType];
    this._currentMeta.singleEmoji = singleEmojiElem? singleEmojiElem.innerText: "";
    // - Tag
    this._currentMeta.multi = this._multiChk.checked;
    this._currentMeta.tagAsMarker = this._tagAsMarkerChk.checked;
    this._currentMeta.predefinedTags = this._predefinedTagsField.value.split(",")
    // - Slider
    this._currentMeta.sliderAxisLabel = this._sliderAxisLabelField.value;
    this._currentMeta.stopCount = this._stopCountField.value? parseInt(this._stopCountField.value) : 2;
    this._currentMeta.stopLabels = this._stopLabelsField.value.split(",")
    // - Session names
    let sessionNames: string[] = [];
    if (this._currentMeta.canSlider) {
      if (this.generativeStopRadioElem.checked) {
        this._currentMeta.stopCount = -2
        const today = new Intl.DateTimeFormat('en-GB').format(new Date())
        sessionNames = [today];
      } else {
        if (this._currentMeta.stopLabels.length == 1 && this._currentMeta.stopLabels[0] == "") {
          for (let i = 1; i <= this._currentMeta.stopCount; i++) {
            sessionNames.push(i.toString());
          }
        } else {
          sessionNames = this._currentMeta.stopLabels;
        }
      }
    }

    /** Create and share new Play */
    const newSpaceEh = await this._store.newPlay({
        name: this._nameField.value,
        origin:this._templateField.value,
        surface,
        meta:this._currentMeta
      },
      sessionNames);
    // - Notify parent
    this.dispatchEvent(new CustomEvent('play-added', { detail: newSpaceEh, bubbles: true, composed: true }));
    // - Clear all fields
    // this.resetAllFields();
    // - Close dialog
    const dialog = this.shadowRoot!.getElementById("space-dialog") as Dialog;
    dialog.close()
  }


  resetAllFields(canResetName?: boolean) {
    if (canResetName === undefined || canResetName) this._nameField.value = ''
    this._currentMeta = defaultPlayMeta()
    // - Surface
    for (let placeholder of this._currentPlaceHolders) {
      let field = this.shadowRoot!.getElementById(placeholder + '-gen') as TextField;
      // console.log('field ' + placeholder + ' - ' + field.value)
      field.value = ''
    }
    this._widthField.value = ''
    this._heightField.value = ''
    this._uiField.value = '[]'
    // - Marker
    this._markerTypeField.value = MarkerType[MarkerType.Tag]
    this._multiChk.checked = false;
    // - Tags
    this._tagChk.checked = false;
    this._tagVisibleChk.checked = false;
    this._tagAsMarkerChk.checked = false;
    this._predefinedTagsField.value = ''
    // - Sliders
    this._canSliderChk.checked = false;
    this._sliderAxisLabelField.value = ''
    this.fixedStopRadioElem.checked = false;
    this.generativeStopRadioElem.checked = false;
    this._stopCountField.value = "2"
    this._stopLabelsField.value = ''
    this._canModifyPastChk.checked = false;
  }

  private async handleDialogOpened(e: any) {
    if (this._spaceToPreload) {
      this.loadPreset(this._spaceToPreload);
      this._spaceToPreload = undefined;
    }
    this.requestUpdate()
  }

  private async handleDialogClosing(e: any) {
    this.resetAllFields();
  }

  private handleTemplateSelect(templateName: string): void {
    this.resetAllFields(false);
    this._useTemplateSize = true;
    this._currentTemplate = this._templates.value[templateName]
  }

  private async handlePreview(e: any) {
    this._useTemplateSize = false;
    this.requestUpdate()
  }

  /**
   *   Generate surface from template and form
   */
  generateSurface() {
    /** Html/SVG/JS */
    let surface: any = JSON.parse(this._currentTemplate!.surface);
    let code: string = "";
    if (surface.svg) code = surface.svg;
    if (surface.html) code = surface.html;
    if (surface.canvas) code = surface.canvas;

    /** Create substitution map */
    let subMap: Map<string, string> = new Map();
    for (let placeholder of this._currentPlaceHolders) {
      const txtfield = this.shadowRoot!.getElementById(placeholder + "-gen") as TextField;
      subMap.set(placeholder, txtfield? txtfield.value : placeholder)
    }
    //console.log({subMap})
    /** Replace each placeholder */
    subMap.forEach((value, key, map) => {
      let pattern = "%%" + key + "%%"
      var regex = new RegExp(pattern, "g");
      code = code.replace(regex, value)
    })
    //console.log({code})
    /** Replace field */
    if (surface.svg) surface.svg = code;
    if (surface.html) surface.html = code ;
    if (surface.canvas) surface.canvas = code;

    /** Size */
    if (this._widthField) {
      const x = this._widthField.value;
      const y = this._heightField.value;
      //console.log({x})
      surface.size = {x, y}
    }
    /** Done */
    return {surface, subMap};
  }


  renderTemplateFields() {
    if (!this._currentTemplate || this._currentTemplate.surface === "") {
      return html``
    }

    let surface: any = JSON.parse(this._currentTemplate.surface);

    /** -- Check size -- */
    if (surface.size && this._useTemplateSize) {
      this._widthField.value = surface.size.x;
      this._heightField.value = surface.size.y;
    }

    /** -- Extract Fields  -- */
    //console.log({surface})
    // - Parse template
    const regex = /%%([a-zA-Z_0-9\-]+)%%/gm;
    var code;
    if (surface.svg) code = surface.svg;
    if (surface.html) code = surface.html;
    if (surface.canvas) code = surface.canvas;

    let names: Set<string> = new Set()
    try {
      //let match = regex.exec(code);
      const match = [...code.matchAll(regex)];
      //console.log({match})
      // - Remove duplicates
      for (const pair of match) {
        names.add(pair[1])
      }
      //console.log({names})
    } catch(err) {
      console.info('No variable found in template');
    }
    this._currentPlaceHolders = Array.from(names)
    // - Generate textField for each placeholder
    return html`${this._currentPlaceHolders.map((name)=> html`
      <mwc-textfield outlined id="${name}-gen" label="${name}" value="" @input="${name==='ImageUrl'?this.handleImageUrlField:null}"></mwc-textfield>`
    )}`
  }


  /** Handle special case for ImageUrl field from Map2D template */
  handleImageUrlField(e: any) {
    const imgComp = this.shadowRoot!.getElementById("ImageUrl-gen") as TextField;
    try {
      const _url = new URL(imgComp.value); // check url validity
      let img = new Image();
      img.onload = async () => {
        console.log( img.naturalWidth +' '+ img.naturalHeight );
        this._widthField.value = JSON.stringify(img.naturalWidth);
        this._heightField.value = JSON.stringify(img.naturalHeight);
      };
      img.src = imgComp.value;
    } catch (_) {
      // N/A
    }
  }


  renderMarkerTypePreview(markerType?: string) {
    let locMeta: Dictionary<string> = {};
    locMeta.markerType = markerType? markerType : this.determineMarkerType();
    locMeta.img = this.myProfile!.fields.avatar;
    switch (markerType) {
      case MarkerType[MarkerType.EmojiGroup]:
        locMeta.emoji = "⚽️";
        break
      case MarkerType[MarkerType.AnyEmoji]:
        locMeta.emoji = "😀";
        break
      case MarkerType[MarkerType.SingleEmoji]:
      default:
        locMeta.emoji = "♥️";
        break;
    }
    locMeta.color = this.myProfile!.fields.color;
    locMeta.name = this.myProfile!.nickname;
    return html `<div id="marker-preview" class="location-marker">${renderMarker(locMeta, false)}</div>`
  }


  renderSurfacePreview() {
    if (!this._currentTemplate || this._currentTemplate.surface === "") {
      return html`<div id="thumbnail"></div>`
    }
    let {surface, _subMap}: any = this.generateSurface();
    const ratio: number = (surface.size && surface.size.x > 0)? surface.size.y / surface.size.x : 1;
    const w: number = 200;
    const h: number = 200 * ratio;
    let uiItems = html ``;
    try {
      const ui = JSON.parse(this._uiField.value);
      uiItems = this._uiField ? renderUiItems(ui, w / surface.size.x, h / surface.size.y) : html``;
    } catch (e) {
      console.warn("Failed to parse uiField. Could be empty");
      //console.error(e)
    }
    var preview;
    if (surface.html) {
      preview =
        html`
          ${uiItems}
          <div style="width: ${w}px; height: ${h}px;" id="surface-preview-div">
            ${unsafeHTML(surface.html)}
          </div>
        `;
    }
    if (surface.svg) {
      preview = html`
        <svg xmlns="http://www.w3.org/2000/svg"
             width="${w}px"
             height="${h}px"
             viewBox="0 0 ${surface.size.x} ${surface.size.y}"
             preserveAspectRatio="none"
             id="surface-preview-svg">
          ${uiItems}
          ${unsafeSVG(surface.svg)}
        </svg>`
      ;
    }
    if (surface.canvas) {
      this._canvas = surface.canvas;
      preview = html`
      <canvas id="preview-canvas" width="${w}" height="${h}"
              style="border:1px solid #324acb;">`
    }
    return html`
      <div id="thumbnail">${preview}</div>
    `
  }

  handleCanTagClick(e: any) {
    this._currentMeta.canTag = !this._currentMeta.canTag;
    this.requestUpdate()
  }

  handleCanTagBeVisibleClick(e: any) {
    this._currentMeta.tagVisible = !this._currentMeta.tagVisible;
    this.requestUpdate()
  }

  handleCanSliderClick(e: any) {
    this._currentMeta.canSlider = !this._currentMeta.canSlider;
    this.requestUpdate()
  }

  handleCanModifyPastClick(e: any) {
    this._currentMeta.canModifyPast = !this._currentMeta.canModifyPast;
    this.requestUpdate()
  }

  handleStopTypeChange(e: any) {
    const fixedStopRadio = this.shadowRoot!.getElementById("fixed-stop-radio") as Radio;
    this._currentMeta.stopCount = fixedStopRadio!.checked? parseInt(fixedStopRadio.value) : -parseInt(fixedStopRadio.value);
    this.requestUpdate()
  }

  handleMarkerTypeSelect(e: any) {
    //console.log({e})
    this.requestUpdate()
  }

  handleEmojiGroupSelect(e?: any) {
    console.log("handleEmojiGroupSelect")
    //console.log({e})
    const selectedName = e.explicitOriginalTarget.value;
    console.log("selectedName: " + selectedName)
    if (!selectedName || selectedName == "") {
      return;
    }
    /** Build emoji list */
    //const maybeEmojiGroupSelector = this.shadowRoot!.getElementById("emoji-group-field") as Select;
    let unicodes = ""
    // FIXME: should retrieve group by eh instead of name
    for (const [eh, group] of Object.entries(this._emojiGroups.value)) {
      if (group.name == selectedName) {
        unicodes = group.unicodes.reduce((prev, cur, idx) => prev += cur);
        this._currentMeta.emojiGroup = eh;
        break;
      }
    }
    //const emojiGroup: EmojiGroupEntry = this._emojiGroups.value[maybeEmojiGroupSelector.value];
    console.log("unicodes string: " + unicodes)
    let unicodeContainer = this.shadowRoot!.getElementById("space-unicodes");
    unicodeContainer!.innerHTML = unicodes
  }

  handleSvgMarkerSelect(e?: any) {
    console.log("handleSvgMarkerSelect")
    //console.log({e})
    //const selectedName = e.explicitOriginalTarget.value;
    const selectedName = e.currentTarget.value;
    console.log("selectedName: " + selectedName)
    if (!selectedName || selectedName == "") {
      return;
    }

    //let container = this.shadowRoot!.getElementById("svg-marker-container");
    //container!.innerHTML = ""

    /** Find svg marker and set to preview */
    // FIXME: should retrieve svgMarker by eh instead of name
    for (const [eh, svgMarker] of Object.entries(this._svgMarkers.value)) {
      if (svgMarker.name == selectedName) {
        // console.log("svg marker found: " + selectedName)
        this._currentMeta.svgMarker = eh;
        break;
      }
    }
  }

  async openEmojiGroupDialog(groupEh: EntryHashB64 | null) {
    let group = undefined;
    if (groupEh) {
      group = this._emojiGroups.value[groupEh]
    }
    const dialog = this.emojiGroupDialogElem;
    dialog.clearAllFields();
    dialog.open(group);
    if (group) {
      dialog.loadPreset(group);
    }
  }

  async openSvgMarkerDialog(eh: EntryHashB64 | null) {
    let svgMarker = undefined;
    if (eh) {
      svgMarker = this._svgMarkers.value[eh]
    }
    const dialog = this.svgMarkerDialogElem;
    dialog.clearAllFields();
    dialog.open(svgMarker);
    if (svgMarker) {
      dialog.loadPreset(svgMarker);
    }
  }


  render() {
    /** Determine currentTemplate */
    if (!this._currentTemplate || this._currentTemplate.surface === "") {
      let firstTemplate = Object.keys(this._templates.value)[0];
      //console.log(firstTemplate)
      this._currentTemplate = this._templates.value[firstTemplate]? this._templates.value[firstTemplate] : null
      //console.log("_currentTemplate: " + (this._currentTemplate? this._currentTemplate.name : "none"))
    }
    let selectedTemplateUi = this.renderTemplateFields()
    //console.log({selectedTemplateUi})

    const boxExample = `{ "box": {"left": 100, "top": 10, "width": 100, "height": 50},
      "style": "background-color:white;border-radius:10px;",
      "content": "Land of the Lost"}`

    /** Render emoji picker / selector */
    let maybeMarkerTypeItems = html ``
    const markerType: MarkerType = MarkerType[this.determineMarkerType() as keyof typeof MarkerType];
    switch (markerType) {
      case MarkerType.SingleEmoji:
        let emoji = this._currentMeta.singleEmoji != "" ? this._currentMeta.singleEmoji : "😀";
        maybeMarkerTypeItems = html`
            <span id="space-unicodes" style="margin-top:20px;font-size:${EMOJI_WIDTH}px;display:inline-flex;">${emoji}</span>
          <details style="margin-top:10px;">
            <summary>Select Emoji</summary>
            <emoji-picker id="emoji-picker" class="light" style="height: 300px;"></emoji-picker>
          </details>
        `
        break;
      case MarkerType.EmojiGroup:
        /** Build group list */
        const groups = Object.entries(this._emojiGroups.value).map(
          ([key, emojiGroup]) => {
            return html`
                     <mwc-list-item class="emoji-group-li" value="${emojiGroup.name}" .selected=${key == this._currentMeta.emojiGroup}>
                       ${emojiGroup.name}
                     </mwc-list-item>
                   `
          }
        )
        /** Get current unicodes */
        let unicodes = ""
        if (this._currentMeta.emojiGroup) {
          const currentGroup = this._emojiGroups.value[this._currentMeta.emojiGroup];
          unicodes = currentGroup.unicodes.reduce((prev, cur, idx) => prev += cur);
        }
        /** Render */
        maybeMarkerTypeItems = html`
          <mwc-icon-button icon="add_circle" style="margin-top:10px;" @click=${() => this.openEmojiGroupDialog(null)}></mwc-icon-button>
          <mwc-icon-button icon="edit" style="margin-top:10px;" @click=${() => this.openEmojiGroupDialog(this._currentMeta.emojiGroup)}></mwc-icon-button>
          <mwc-select id="emoji-group-field" required style="" label="Subset" @closing=${(e:any)=>{e.stopPropagation(); this.handleEmojiGroupSelect(e)}}>
            ${groups}
          </mwc-select>
          <!-- Display Unicode List / Grid -->
          <!-- <div style="min-height:40px;"> -->
            <div id="space-unicodes" class="unicodes-container" style="font-size:28px;margin-top:10px;padding-top:8px;padding-bottom:2px">${unicodes}</div>
          <!-- </div> -->
        `
        break;

      case MarkerType.SvgMarker:
        /** Build marker list */
        if (!this._currentMeta.svgMarker && Object.keys(this._svgMarkers.value).length > 0) {
          this._currentMeta.svgMarker = Object.keys(this._svgMarkers.value)[0];
        }
        const markers = Object.entries(this._svgMarkers.value).map(
          ([key, svgMarker]) => {
            // console.log(" - " + svgMarker.name + ": " + key)
            let currentMarker = renderSvgMarker(svgMarker.value, this.myProfile!.fields.color)
            return html`
                     <mwc-list-item class="svg-marker-li" value="${svgMarker.name}" .selected=${key == this._currentMeta.svgMarker}>
                       ${svgMarker.name}
                       ${currentMarker}
                     </mwc-list-item>
                   `
          }
        )
        /** Get current unicodes */
        let selectedMarker = html``;
        if (this._currentMeta.svgMarker) {
          const marker = this._svgMarkers.value[this._currentMeta.svgMarker]
          //console.log({marker})
          selectedMarker = renderSvgMarker(marker.value, this.myProfile!.fields.color)
        }
        /** Render */
        maybeMarkerTypeItems = html`
          <mwc-icon-button icon="add_circle" style="margin-top:10px;" @click=${() => this.openSvgMarkerDialog(null)}></mwc-icon-button>
          <mwc-icon-button icon="edit" style="margin-top:10px;" @click=${() => this.openSvgMarkerDialog(this._currentMeta.svgMarker)}></mwc-icon-button>
          <mwc-select id="svg-marker-field" required style="display:inline-flex;width:230px;" label="Name" @closing=${(e:any)=>{e.stopPropagation(); this.handleSvgMarkerSelect(e)}}>
            ${markers}
          </mwc-select>
          <div id="svg-marker-container">${selectedMarker}</div>
        `
        break;

      default:
        break;
    }

    const fixedRadio = this.shadowRoot!.getElementById("fixed-stop-radio") as Radio;
    const isFixedSelected = fixedRadio && fixedRadio.checked;

    /** Main Render */
    return html`
<mwc-dialog id="space-dialog" heading="New space" @closing=${this.handleDialogClosing} @opened=${this.handleDialogOpened}>
  <!-- Name -->
  <mwc-textfield outlined dialogInitialFocus type="text"
                 @input=${() => (this.shadowRoot!.getElementById("name-field") as TextField).reportValidity()}
                 id="name-field" minlength="3" maxlength="64" label="Name" autoValidate=true required></mwc-textfield>
  <!-- Template/Surface -->
  <h3 style="margin-bottom: 15px;">Surface</h3>
  ${this.renderSurfacePreview()}
  <mwc-select fixedMenuPosition required id="template-field" label="Template" @select=${this.handleTemplateSelect}  @closing=${(e:any)=>e.stopPropagation()}>
      ${Object.entries(this._templates.value).map(
        ([key, template]) => html`
        <mwc-list-item
          @request-selected=${() => this.handleTemplateSelect(key)}
          .selected=${this._templates.value[key].name === this._currentTemplate!.name}
          value="${key}"
          >${template.name}
        </mwc-list-item>
      `)}
  </mwc-select>
  ${selectedTemplateUi}
  <mwc-textfield id="width-field"  class="rounded" outlined pattern="[0-9]+" minlength="3" maxlength="4" label="Width" autoValidate=true required></mwc-textfield>
  <mwc-textfield id="height-field" class="rounded" outlined pattern="[0-9]+" minlength="3" maxlength="4" label="Height" autoValidate=true required></mwc-textfield>
  <!-- UI BOX -->
  <details style="margin-top:10px;">
  <summary>Extra UI elements</summary>
    <mwc-textarea type="text" @input=${() => (this.shadowRoot!.getElementById("ui-field") as TextArea).reportValidity()}
                  id="ui-field" value="[]" helper="Array of 'Box' objects. Example: ${boxExample}" rows="8" cols="60">
    </mwc-textarea>
  </details>
  <!--  Marker -->
  <h3 style="margin-top:25px;margin-bottom:10px;">Markers</h3>
  <mwc-select label="Type" id="marker-select" required @closing=${(e:any)=>{e.stopPropagation(); this.handleMarkerTypeSelect(e)}}>
    <mwc-list-item selected value="${MarkerType[MarkerType.Avatar]}">Avatar ${this.renderMarkerTypePreview(MarkerType[MarkerType.Avatar])}</mwc-list-item>
    <mwc-list-item value="${MarkerType[MarkerType.Initials]}">Initials ${this.renderMarkerTypePreview(MarkerType[MarkerType.Initials])}</mwc-list-item>
    <mwc-list-item value="${MarkerType[MarkerType.SvgMarker]}">Colored SVG ${this.renderMarkerTypePreview(MarkerType[MarkerType.SvgMarker])}</mwc-list-item>
    <mwc-list-item value="${MarkerType[MarkerType.SingleEmoji]}">Predefined Emoji ${this.renderMarkerTypePreview(MarkerType[MarkerType.SingleEmoji])}</mwc-list-item>
    <mwc-list-item value="${MarkerType[MarkerType.EmojiGroup]}">Emoji subset ${this.renderMarkerTypePreview(MarkerType[MarkerType.EmojiGroup])}</mwc-list-item>
    <mwc-list-item value="${MarkerType[MarkerType.AnyEmoji]}">Any Emoji ${this.renderMarkerTypePreview(MarkerType[MarkerType.AnyEmoji])}</mwc-list-item>
    <mwc-list-item value="${MarkerType[MarkerType.Tag]}">Tag ${this.renderMarkerTypePreview(MarkerType[MarkerType.Tag])}</mwc-list-item>
  </mwc-select>
  ${maybeMarkerTypeItems}
  <mwc-formfield label="Allow multiple markers per user" style="margin-top:10px">
    <mwc-checkbox id="multi-chk"></mwc-checkbox>
  </mwc-formfield>
  <!-- Tags -->
  <h3 style="margin-top:25px;margin-bottom:10px;">Tags</h3>
  <mwc-formfield label="Enable tag per marker">
    <mwc-checkbox id="tag-chk" @click=${this.handleCanTagClick}></mwc-checkbox>
  </mwc-formfield>
  <mwc-formfield label="Display tag on surface" style="margin-left:10px">
    <mwc-checkbox id="tag-visible-chk" .disabled="${!this._currentMeta.canTag}" @click=${this.handleCanTagBeVisibleClick}></mwc-checkbox>
  </mwc-formfield>
  <mwc-formfield label="Display tag as marker" style="margin-left:20px">
    <mwc-checkbox id="tag-as-marker-chk" .disabled="${!this._currentMeta.tagVisible || !this._currentMeta.canTag }"></mwc-checkbox>
  </mwc-formfield>
  <mwc-textfield outlined style="margin-left:25px" type="text" .disabled="${!this._currentMeta.canTag}"
                 id="predefined-tags-field" label="Predefined tags"  helper="comma separated text" autoValidate=true>
  </mwc-textfield>
  <!-- Time Slider -->
  <h3 style="margin-top:15px;margin-bottom:-5px;">Slider</h3>
  <mwc-formfield label="Use slider" style="display:inline-block;margin-right:10px;">
    <mwc-checkbox id="can-slider-chk" @click=${this.handleCanSliderClick}></mwc-checkbox>
  </mwc-formfield>
  <mwc-textfield outlined type="text" .disabled="${!this._currentMeta.canSlider}" style="display:inline-flex;"
                 id="slider-axis-label-field" minlength="3" maxlength="32" label="Axis label" autoValidate=true required></mwc-textfield>
  <!-- Stops Type -->
  <h4 style="margin-bottom:10px;margin-left:5px">Stops</h4>
  <!-- Fixed Stops -->
  <mwc-formfield label="Fixed number of stops">
    <mwc-radio id="fixed-stop-radio" name="a" value="fixed" .disabled="${!this._currentMeta.canSlider}" @change=${this.handleStopTypeChange}></mwc-radio>
  </mwc-formfield>
  <div id="fixed-stops-div" style="margin-left:30px;margin-top:5px;">
    <mwc-textfield id="stop-count-field" outlined type="number" style="margin-right:10px;width:90px;"
                   .disabled="${!this._currentMeta.canSlider || !isFixedSelected}"
                   label="Number" helper="min:2" min="2" pattern="[0-9]+" minlength="3" maxlength="4"
                   value="${this._currentMeta.stopCount}" autoValidate=true required>
    </mwc-textfield>
    <mwc-textfield id="stop-labels-field" outlined type="text"  style="flex-grow:5;"
                   .disabled="${!this._currentMeta.canSlider || !isFixedSelected}" label="Stop labels"
                   helper="comma separated text, leave empty for just numbers">
    </mwc-textfield>
  </div>
  <!-- Generative Stops -->
  <mwc-formfield label="New stop every day">
    <mwc-radio id="generative-stop-radio" name="a" value="generative" .disabled="${!this._currentMeta.canSlider}" @change=${this.handleStopTypeChange}></mwc-radio>
  </mwc-formfield>
  <div id="generative-stops-div" style="margin-left:20px;min-height:50px;">
    <mwc-formfield label="Allow modification of past stops">
    <mwc-checkbox id="can-modify-past-chk" .disabled="${!this._currentMeta.canSlider || isFixedSelected}" @click=${this.handleCanModifyPastClick}></mwc-checkbox>
    </mwc-formfield>
  </div>
  <!-- Dialog buttons -->
  <mwc-button id="primary-action-button" raised slot="primaryAction" @click=${this.handleOk}>ok</mwc-button>
  <mwc-button slot="secondaryAction"  dialogAction="cancel">cancel</mwc-button>
  <mwc-button slot="secondaryAction" @click=${this.handlePreview}>preview</mwc-button>
  <!-- Inner dialogs -->
  <where-emoji-group-dialog id="emoji-group-dialog" @emoji-group-added=${(e:any) => this.handleGroupAdded(e.detail)}></where-emoji-group-dialog>
  <where-svg-marker-dialog id="svg-marker-dialog" @svg-marker-added=${(e:any) => this.handleSvgMarkerAdded(e.detail)}></where-svg-marker-dialog>
</mwc-dialog>
`
  }

  handleGroupAdded(eh: EntryHashB64) {
    this._currentMeta.emojiGroup = eh;
    const emojiGroup = this._emojiGroups.value[eh];
    const unicodes = emojiGroup.unicodes.reduce((prev, cur, idx) => prev += cur);
    let unicodeContainer = this.shadowRoot!.getElementById("space-unicodes");
    unicodeContainer!.innerHTML = unicodes
    let emojiGroupField = this.shadowRoot!.getElementById("emoji-group-field") as Select;
    console.log({emojiGroupField})
    //console.log("handleGroupAdded")
    emojiGroupField.select(emojiGroupField.children.length - 1);
  }

  handleSvgMarkerAdded(eh: EntryHashB64) {
    this._currentMeta.svgMarker = eh;
    //const svgMarker = this._svgMarkers.value[eh];
    //let svgMarkerContainer = this.shadowRoot!.getElementById("svg-marker-container");
    //svgMarkerContainer!.innerHTML = svgMarker.value
    let svgMarkerField = this.shadowRoot!.getElementById("svg-marker-field") as Select;
    console.log({svgMarkerField})
    // Select last one
    svgMarkerField.select(svgMarkerField.children.length - 1);
  }


  static get scopedElements() {
    return {
      'sl-avatar': SlAvatar,
      "mwc-select": Select,
      "mwc-list-item": ListItem,
      "mwc-button": Button,
      "mwc-icon-button": IconButton,
      "mwc-dialog": Dialog,
      "mwc-textfield": TextField,
      "mwc-textarea": TextArea,
      "mwc-formfield": Formfield,
      "mwc-checkbox": Checkbox,
      "mwc-radio": Radio,
      "where-emoji-group-dialog" : WhereEmojiGroupDialog,
      "where-svg-marker-dialog" : WhereSvgMarkerDialog,
      "emoji-picker": customElements.get('emoji-picker'),
    };
  }
  static get styles() {
    return [
      sharedStyles,
      css`
        emoji-picker {
          width: auto;
        }
        .svg-marker-li {
          line-height: 0;
        }
        #svg-marker-container {
          display: inline-flex;
          margin-top: 10px;
          /*padding: 4px;*/
          /*background-color: whitesmoke;*/
          /*border: 1px solid gray;*/
          min-width: 40px;
          min-height: 40px;
        }
        mwc-dialog div, mwc-formfield, mwc-select {
          display: flex;
        }
        #space-dialog {
          --mdc-dialog-min-width: 600px;
        }
        #width-field, #height-field {
          margin-top: 10px;
          display: inline-flex;
        }
        #thumbnail {
          position: relative;
          padding-left: 10px;
          min-width: 200px;
          min-height: 50px;
          margin-left: 10px;
          padding-left: 0px;
          float: right;
          border: 1px solid grey;
          background-color: rgb(252, 252, 252);
        }
        mwc-textfield {
          margin-top: 10px;
          display: flex;
        }
        mwc-formfield {
          height: 32px;
        }
        mwc-textfield.rounded {
          --mdc-shape-small: 28px;
          width: 8em;
        }

        mwc-list-item {
          height: 50px;
          line-height: 40px;
        }

        #marker-select {
          margin-top: 5px;
          display: inline-flex;
          min-width: 230px;
        }

        .location-marker {
          display: inline-flex;
        }

        .ui-item {
          position: absolute;
          pointer-events: none;
          text-align: center;
          flex-shrink: 0;
        }
`,
    ];
  }
}
