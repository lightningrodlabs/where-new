import * as path from 'path'
import { app } from 'electron'
import { HolochainRunnerOptions, StateSignal, PathOptions } from 'electron-holochain'
import {MAIN_APP_ID, COMMUNITY_PROXY_URL} from './constants'

// these messages get seen on the splash page
export enum StateSignalText {
  IsFirstRun = 'Welcome to Where...',
  IsNotFirstRun = 'Loading...',
  CreatingKeys = 'Creating cryptographic keys...',
  RegisteringDna = 'Registering Profiles DNA to Holochain...',
  InstallingApp = 'Installing DNA bundle to Holochain...',
  EnablingApp = 'Enabling DNA...',
  AddingAppInterface = 'Attaching API network port...',
}

export function stateSignalToText(state: StateSignal): StateSignalText {
  switch (state) {
    case StateSignal.IsFirstRun:
      return StateSignalText.IsFirstRun
    case StateSignal.IsNotFirstRun:
      return StateSignalText.IsNotFirstRun
    case StateSignal.CreatingKeys:
      return StateSignalText.CreatingKeys
    case StateSignal.RegisteringDna:
      return StateSignalText.RegisteringDna
    case StateSignal.InstallingApp:
      return StateSignalText.InstallingApp
    case StateSignal.EnablingApp:
      return StateSignalText.EnablingApp
    case StateSignal.AddingAppInterface:
      return StateSignalText.AddingAppInterface
  }
}

const whereDnaPath = app.isPackaged
  ? path.join(app.getAppPath(), '../app.asar.unpacked/binaries/where.dna')
  : path.join(app.getAppPath(), '../dna/workdir/dna/where.dna')

// in production
// must point to unpacked versions, not in an asar archive
// in development
// fall back on defaults in the electron-holochain package
const BINARY_PATHS: PathOptions | undefined = app.isPackaged
  ? {
      holochainRunnerBinaryPath: path.join(
        __dirname,
        `../../app.asar.unpacked/binaries/holochain-runner${process.platform === 'win32' ? '.exe' : ''}`
      ),
      lairKeystoreBinaryPath: path.join(
        __dirname,
        `../../app.asar.unpacked/binaries/lair-keystore${process.platform === 'win32' ? '.exe' : ''}`,
      ),
    }
  : undefined


/**
 *
 */
function createHolochainOptions(uid: string, storagePath: string): HolochainRunnerOptions {
  const options: HolochainRunnerOptions = {
    dnaPath: whereDnaPath,
    datastorePath: path.join(storagePath, 'databases-' + app.getVersion()),
    appId: MAIN_APP_ID + '-' + uid,
    //appId: MAIN_APP_ID,
    //appWsPort: 8889,
    adminWsPort: 1235,
    keystorePath: path.join(storagePath, 'keystore-' + app.getVersion()),
    //proxyUrl: COMMUNITY_PROXY_URL,
    //bootstrapUrl: "",
    uid,
  }
  return options;
}

export { whereDnaPath, BINARY_PATHS, createHolochainOptions }
