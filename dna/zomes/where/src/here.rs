use hdk::prelude::*;

use std::collections::BTreeMap;
use holo_hash::{EntryHashB64, AgentPubKeyB64, HeaderHashB64};

use crate::{
    error::*,
    placement_session::*,
};

/// Here entry definition
#[hdk_entry(id = "here")]
#[derive(Clone)]
#[serde(rename_all = "camelCase")]
pub struct Here {
    value: String, // a location in a some arbitrary space (Json encoded)
    session_eh: EntryHashB64,
    meta: BTreeMap<String, String>, // contextualized meaning of the value
}


/// Input to the create channel call
#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
#[serde(rename_all = "camelCase")]
pub struct AddHereInput {
    pub space_eh: EntryHashB64,
    pub session_index: u32,
    pub value: String,
    pub meta: BTreeMap<String, String>,
}

#[hdk_extern]
fn add_here(input: AddHereInput) -> ExternResult<HeaderHashB64> {
    // Find session
    let get_input = GetSessionInput {space_eh: input.space_eh.into(), index: input.session_index};
    let maybe_session_eh = get_session(get_input)?;
    let session_eh = match maybe_session_eh {
        Some(eh) => eh,
        None => return error("Session not found"),
    };
    // Create and link 'Here'
    let here = Here {value: input.value, session_eh: session_eh.clone().into(), meta: input.meta};
    let here_eh = hash_entry(here.clone())?;
    create_entry(here.clone())?;
    let hh = create_link(session_eh, here_eh, ())?;
    Ok(hh.into())
}

#[hdk_extern]
fn delete_here(link_hh: HeaderHashB64) -> ExternResult<()> {
    delete_link(link_hh.into())?;
    Ok(())
}

/// Input to the create channel call
#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
pub struct HereOutput {
    pub entry: Here,
    pub hash: HeaderHashB64,
    pub author: AgentPubKeyB64,
}


// #[hdk_extern]
// fn get_heres2(spaceEh: EntryHashB64, sessionIndex: u32) -> ExternResult<Vec<HereOutput>> {
//     let heres = get_heres_inner(sessionEh.into())?;
//     Ok(heres)
// }


#[hdk_extern]
fn get_heres(session_eh: EntryHashB64) -> ExternResult<Vec<HereOutput>> {
    let heres = get_heres_inner(session_eh.into())?;
    Ok(heres)
}

fn get_heres_inner(base: EntryHash) -> WhereResult<Vec<HereOutput>> {
    let links = get_links(base.into(), None)?;

    let mut output = Vec::with_capacity(links.len());

    // for every link get details on the target and create the message
    for link in links.into_iter().map(|link| link) {
        let w = match get_details(link.target, GetOptions::content())? {
            Some(Details::Entry(EntryDetails {
                entry, mut headers, ..
            })) => {
                // Turn the entry into a HereOutput
                let entry: Here = entry.try_into()?;
                let signed_header = match headers.pop() {
                    Some(h) => h,
                    // Ignoring missing messages
                    None => continue,
                };

                // Create the output for the UI
                HereOutput {
                    entry,
                    hash: link.create_link_hash.into(),
                    author: signed_header.header().author().clone().into()
                }
            }
            // Here is missing. This could be an error but we are
            // going to ignore it.
            _ => continue,
        };
        output.push(w);
    }

    Ok(output)
}
