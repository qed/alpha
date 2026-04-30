// CRM — Pipeline view (table + kanban toggle)
const CRM = ({ openContact, layout = "table" }) => {
  const [stageFilter, setStageFilter] = React.useState("all");
  const [hoodFilter, setHoodFilter] = React.useState("all");

  const filtered = CONTACTS.filter(c =>
    (stageFilter === "all" || c.stage === stageFilter) &&
    (hoodFilter === "all" || c.neighborhood === hoodFilter)
  );

  const hoods = [...new Set(CONTACTS.map(c => c.neighborhood))];

  return (
    <div>
      <div className="filter-row">
        <span className="f-label">Stage</span>
        <button className={`f-chip ${stageFilter === "all" ? "active" : ""}`} onClick={() => setStageFilter("all")}>
          All <span className="ct">{CONTACTS.length}</span>
        </button>
        {STAGES.map(s => {
          const ct = CONTACTS.filter(c => c.stage === s.id).length;
          return (
            <button key={s.id} className={`f-chip ${stageFilter === s.id ? "active" : ""}`} onClick={() => setStageFilter(s.id)}>
              {s.label} <span className="ct">{ct}</span>
            </button>
          );
        })}
        <span className="f-label" style={{marginLeft: 14}}>Area</span>
        <button className={`f-chip ${hoodFilter === "all" ? "active" : ""}`} onClick={() => setHoodFilter("all")}>All</button>
        {hoods.map(h => (
          <button key={h} className={`f-chip ${hoodFilter === h ? "active" : ""}`} onClick={() => setHoodFilter(h)}>{h}</button>
        ))}
      </div>

      {layout === "table" ? (
        <div className="panel-op">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Family</th>
                <th>Stage</th>
                <th>Heat</th>
                <th>Area</th>
                <th>Concerns</th>
                <th>Last Touch</th>
                <th>Next Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} onClick={() => openContact(c.id)}>
                  <td>
                    <div className="name-cell">
                      <div className="av">{c.avatar}</div>
                      <div>
                        <div className="nm">{c.name}</div>
                        <div className="sub">{c.kids.join(" · ")}</div>
                      </div>
                    </div>
                  </td>
                  <td><StagePill stage={c.stage}/></td>
                  <td><Heat value={c.heat}/></td>
                  <td className="small">{c.neighborhood}</td>
                  <td>
                    <div style={{display:"flex", flexWrap:"wrap", gap:4}}>
                      {c.concerns.slice(0,2).map(x => <span key={x} className="concern-tag">{x}</span>)}
                      {c.concerns.length > 2 && <span className="small">+{c.concerns.length - 2}</span>}
                    </div>
                  </td>
                  <td className={`age ${c.daysSince > 14 ? "old" : ""}`}>{c.lastTouch}</td>
                  <td className="small" style={{maxWidth: 280}}>{c.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="kanban">
          {STAGES.map(s => {
            const cards = CONTACTS.filter(c => c.stage === s.id);
            return (
              <div className="kan-col" key={s.id}>
                <div className="kan-col-head">
                  <h4>{s.label}</h4>
                  <span className="ct">{cards.length}</span>
                </div>
                {cards.map(c => (
                  <div className="kan-card" key={c.id} onClick={() => openContact(c.id)}>
                    <div className="nm">{c.name}</div>
                    <div className="sub">{c.kids.length} kid{c.kids.length>1?"s":""} · {c.neighborhood}</div>
                    <div className="row">
                      <Heat value={c.heat}/>
                      <span style={{fontSize: 10}}>{c.lastTouch}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Contact Drawer with Co-pilot
const ContactDrawer = ({ contact, onClose, openSend }) => {
  const [signalState, setSignalState] = React.useState(contact.signals);
  const toggleSignal = (id) => {
    setSignalState(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  // Co-pilot logic: synthesize from contact data
  const concernText = contact.concerns.length ?
    `Her biggest concern is ${contact.concerns[0]}${contact.concerns[1] ? `, with secondary worry around ${contact.concerns[1]}` : ""}.` :
    "No remaining concerns flagged.";

  const suggested = LIBRARY.filter(l => contact.concerns.includes(l.concern)).slice(0, 3);
  const fallback = LIBRARY.slice(0, 3);
  const suggList = suggested.length ? suggested : fallback;

  const nextMove = contact.nextAction || "Send a check-in note. Don't let her go cold.";

  return (
    <>
      <div className="drawer-back" onClick={onClose}/>
      <div className="drawer">
        <div className="drawer-main">
          <div className="drawer-head">
            <div className="top-row">
              <div style={{display:"flex", alignItems:"center", gap:14}}>
                <div className="av" style={{width:48, height:48, fontSize:16, borderRadius:"50%", background:"var(--alpha-sky)", color:"var(--alpha-blue-ink)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-display)", fontWeight:800}}>{contact.avatar}</div>
                <div>
                  <h1>{contact.name}</h1>
                  <div className="meta-line">
                    <span><b>{contact.kids.join(" · ")}</b></span>
                    <span>{contact.neighborhood}</span>
                  </div>
                </div>
              </div>
              <button className="btn-op ghost" onClick={onClose}><Icon.X/></button>
            </div>
            <div style={{display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
              <StagePill stage={contact.stage}/>
              <Heat value={contact.heat}/>
              <span style={{fontSize:12, color:"var(--ink-4)"}}>· Last touch {contact.lastTouch}</span>
              <div style={{flex:1}}/>
              <button className="btn-op sm"><Icon.Phone/> Call</button>
              <button className="btn-op sm" onClick={() => openSend(contact)}><Icon.Send/> Send from library</button>
              <button className="btn-op sm primary"><Icon.Check/> Log activity</button>
            </div>
          </div>

          {/* CO-PILOT */}
          <div style={{padding:"24px 32px 0"}}>
            <div className="copilot">
              <div className="badge"><span className="dot"/>Conversation Co-pilot</div>
              <h4>
                Last touch with <b>{contact.name}</b> was {contact.lastTouch}. {concernText} She's at heat {contact.heat}/5{contact.heat >= 4 ? " — close." : "."}
              </h4>
              <div className="next-move">
                <Icon.Sparkle/>
                <div>
                  <div className="lbl">Suggested next move</div>
                  <div className="txt">{nextMove}</div>
                </div>
              </div>
              <div className="suggest-row">
                {suggList.map(l => (
                  <div className="suggest-card" key={l.id} onClick={() => openSend(contact, l)}>
                    <div className="typ">{l.typeLabel}</div>
                    <div className="ti">{l.title}</div>
                    <div className="why">
                      {contact.concerns.includes(l.concern) ? `Matches: ${l.concern}` : `${l.sends} sends · ${l.helpfulness}% helpful`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="drawer-section">
            <h3>Activity</h3>
            <div className="timeline">
              {(contact.timeline.length ? contact.timeline : [{type:"stage", when:"3 days ago", title:"Stage → Interested", body:"From cold."}]).map((e, i) => (
                <div key={i} className={`tl-event t-${e.type}`}>
                  <div className="tl-when">{e.when}</div>
                  <div className="tl-title">{e.title}</div>
                  {e.body && <div className="tl-body">{e.body}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ASIDE */}
        <aside className="drawer-aside">
          <div className="aside-block">
            <h5>About</h5>
            <div className="aside-list">
              <div className="row"><span className="lbl">Family</span><span className="val">{contact.family}</span></div>
              <div className="row"><span className="lbl">Email</span><span className="val">{contact.email}</span></div>
              {contact.phone && <div className="row"><span className="lbl">Phone</span><span className="val">{contact.phone}</span></div>}
              <div className="row"><span className="lbl">Source</span><span className="val">{contact.referrer}</span></div>
              <div className="row"><span className="lbl">Area</span><span className="val">{contact.neighborhood}</span></div>
            </div>
          </div>

          <div className="aside-block">
            <h5>Engagement signals</h5>
            <div className="signal-grid">
              {SIGNALS.map(s => {
                const on = signalState.includes(s.id);
                return (
                  <button key={s.id} className={`signal ${on ? "on" : ""}`} onClick={() => toggleSignal(s.id)}>
                    <span className="check">{on && <Icon.Check/>}</span>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="aside-block">
            <h5>Concerns</h5>
            <div className="concern-tags">
              {contact.concerns.map(c => <span key={c} className="concern-tag">{c}</span>)}
              <button className="concern-tag" style={{background:"var(--paper-3)", color:"var(--ink-4)", borderColor:"var(--line)", cursor:"pointer"}}>+ add</button>
            </div>
          </div>

          {contact.notes && (
            <div className="aside-block">
              <h5>Private notes</h5>
              <div style={{fontSize:13, color:"var(--ink-2)", lineHeight:1.55, fontFamily:"var(--font-editorial)", fontStyle:"italic"}}>
                {contact.notes}
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
};

Object.assign(window, { CRM, ContactDrawer });
