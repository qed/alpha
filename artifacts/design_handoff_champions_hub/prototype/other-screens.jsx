// Events + Page Builder + Send Composer

const Events = () => (
  <div>
    <div className="filter-row">
      <span className="f-label">Show</span>
      <button className="f-chip active">Upcoming <span className="ct">{EVENTS.length}</span></button>
      <button className="f-chip">Past</button>
      <button className="f-chip">My events</button>
      <div style={{flex: 1}}/>
      <button className="btn-op primary"><Icon.Plus/> New event</button>
    </div>

    <div className="event-list">
      {EVENTS.map(e => (
        <div className="event-row" key={e.id}>
          <div className="date-block">
            <div className="m">{e.month}</div>
            <div className="d">{e.day}</div>
          </div>
          <div>
            <b>{e.title}</b>
            <div className="desc">{e.where} · {e.when}</div>
            <div style={{marginTop: 8, display:"flex", gap:8, alignItems:"center"}}>
              <span className={`stage ${e.type === "public" ? "stage-interested" : "stage-shadow"}`}>
                <span className="dot"/>{e.type}
              </span>
              <span style={{fontSize:11, color:"var(--ink-4)"}}>RSVPs auto-flow into Pipeline</span>
            </div>
          </div>
          <div className="stats">
            <div><b>{e.rsvps}</b><span style={{color:"var(--ink-4)"}}>/{e.cap}</span></div>
            <div style={{fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", marginTop:2}}>RSVPs</div>
          </div>
        </div>
      ))}
    </div>

    <div className="panel-op" style={{marginTop:24}}>
      <div className="panel-op-head">
        <h3>Recent RSVPs</h3>
        <span className="sub">Auto-added to your Pipeline as "Interested"</span>
      </div>
      <table className="crm-table">
        <thead>
          <tr><th>Family</th><th>Event</th><th>When</th><th>Auto-staged</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><div className="name-cell"><div className="av">JL</div><div><div className="nm">Joon-ho Lee</div><div className="sub">Min, 8 · Erindale</div></div></div></td>
            <td className="small">Saturday Workshop · Nov 22</td>
            <td className="age">2h ago</td>
            <td><StagePill stage="interested"/></td>
          </tr>
          <tr>
            <td><div className="name-cell"><div className="av">KP</div><div><div className="nm">Karen Patel</div><div className="sub">Two kids · Lakeview</div></div></div></td>
            <td className="small">Park Day · Dec 7</td>
            <td className="age">Yesterday</td>
            <td><StagePill stage="interested"/></td>
          </tr>
          <tr>
            <td><div className="name-cell"><div className="av">RS</div><div><div className="nm">Rachel Singh</div><div className="sub">Ezra, 6 · Mineola</div></div></div></td>
            <td className="small">Founders' Coffee · Dec 17</td>
            <td className="age">3 days ago</td>
            <td><StagePill stage="interested"/></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const PageBuilder = () => {
  const [blocks, setBlocks] = React.useState(["hero", "story", "testimonials", "events", "cta"]);
  return (
    <div className="builder">
      <div className="builder-pane">
        <h5>Your URL</h5>
        <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:13, padding:"8px 10px", background:"var(--paper-2)", borderRadius:6, marginBottom:18, color:"var(--alpha-blue)"}}>
          alpha.school/toronto/<span style={{color:"var(--ink)"}}>davidreyes</span>
        </div>
        <h5>Add block</h5>
        <div className="block-pickers">
          <div className="block-picker">+ Hero</div>
          <div className="block-picker">+ Your story</div>
          <div className="block-picker">+ Testimonial</div>
          <div className="block-picker">+ FAQ</div>
          <div className="block-picker">+ Events</div>
          <div className="block-picker">+ Deposit CTA</div>
        </div>
        <h5>Stats (last 30 days)</h5>
        <div className="aside-list">
          <div className="row"><span className="lbl">Visits</span><span className="val">147</span></div>
          <div className="row"><span className="lbl">RSVPs from page</span><span className="val">9</span></div>
          <div className="row"><span className="lbl">Deposits attributed</span><span className="val">3</span></div>
        </div>
        <button className="btn-op primary" style={{marginTop:18, width:"100%", justifyContent:"center"}}>Publish changes</button>
      </div>

      <div className="builder-canvas">
        <div className="preview-block hero-block">
          <div className="block-tag">Hero</div>
          <div style={{fontFamily:"var(--font-display)", fontWeight:800, fontSize:11, letterSpacing:"0.16em", textTransform:"uppercase", color:"var(--alpha-sky)", marginBottom:14}}>Mississauga · Port Credit</div>
          <h1 style={{fontFamily:"var(--font-display)", fontWeight:800, fontSize:48, letterSpacing:"-0.03em", lineHeight:1.05, margin:"0 0 16px", maxWidth:"18ch"}}>
            A new kind of school is <em style={{fontFamily:"var(--font-editorial)", fontStyle:"italic", fontWeight:400, color:"var(--alpha-sky)"}}>opening here.</em>
          </h1>
          <p style={{fontSize:18, lineHeight:1.55, maxWidth:"56ch", color:"var(--alpha-sky)", margin:"0 0 24px"}}>
            I'm David. I'm a dad in Port Credit, and I'm helping bring Alpha — the AI-powered, two-hour-day school that's outperforming every Texas private — to Mississauga in fall 2026.
          </p>
          <div style={{display:"flex", gap:12}}>
            <button className="btn-op primary" style={{background:"#fff", color:"var(--alpha-blue)", borderColor:"#fff"}}>Coffee with David →</button>
            <button className="btn-op" style={{background:"transparent", color:"#fff", borderColor:"rgba(255,255,255,0.4)"}}>Watch 5-min explainer</button>
          </div>
        </div>

        <div className="preview-block">
          <div className="block-tag">Story</div>
          <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--alpha-coral)", marginBottom:10}}>Why I started this</div>
          <h2 style={{fontFamily:"var(--font-editorial)", fontStyle:"italic", fontWeight:400, fontSize:32, lineHeight:1.25, letterSpacing:"-0.015em", margin:"0 0 16px", maxWidth:"24ch"}}>
            I watched my son Mateo go from loving school to dreading Mondays. Something had to give.
          </h2>
          <p style={{fontSize:15, lineHeight:1.6, color:"var(--ink-2)", maxWidth:"60ch", margin:0}}>
            We flew the family to Brownsville last spring. By the third day, I was the one asking the kids if they wanted to stay. This page is what I wish I'd had a year ago.
          </p>
        </div>

        <div className="preview-block">
          <div className="block-tag">Library: testimonial</div>
          <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--alpha-blue)", marginBottom:10}}>From a Brownsville parent</div>
          <blockquote style={{fontFamily:"var(--font-editorial)", fontStyle:"italic", fontWeight:400, fontSize:24, lineHeight:1.35, letterSpacing:"-0.01em", margin:"0 0 12px", maxWidth:"34ch", color:"var(--ink)"}}>
            "I was the most skeptical parent in the room. By March, my daughter was reading Tolstoy."
          </blockquote>
          <div style={{fontSize:12, color:"var(--ink-3)", fontFamily:"var(--font-display)", fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase"}}>— Lakshmi V., parent of Anjali (Grade 4)</div>
        </div>

        <div className="preview-block" style={{background:"var(--paper-3)"}}>
          <div className="block-tag">Events</div>
          <h3 style={{fontFamily:"var(--font-display)", fontWeight:800, fontSize:20, letterSpacing:"-0.015em", margin:"0 0 14px"}}>Come meet us in person</h3>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
            {EVENTS.slice(0,2).map(e => (
              <div key={e.id} style={{background:"#fff", borderRadius:10, padding:"14px 16px", display:"flex", alignItems:"center", gap:12}}>
                <div className="date-block" style={{background:"var(--paper-3)", padding:"6px 10px"}}>
                  <div className="m">{e.month}</div>
                  <div className="d">{e.day}</div>
                </div>
                <div>
                  <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:13}}>{e.title}</div>
                  <div style={{fontSize:11, color:"var(--ink-4)"}}>{e.where}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="preview-block" style={{background:"var(--alpha-sun)"}}>
          <div className="block-tag">CTA</div>
          <h3 style={{fontFamily:"var(--font-display)", fontWeight:800, fontSize:28, letterSpacing:"-0.025em", margin:"0 0 8px"}}>Ready? Reserve a spot for fall 2026.</h3>
          <p style={{fontSize:14, color:"var(--ink-2)", margin:"0 0 16px"}}>$1,000 fully refundable for 60 days. We need 25 to open. Currently at 11.</p>
          <button className="btn-op primary">Place deposit →</button>
        </div>
      </div>
    </div>
  );
};

const SendComposer = ({ contact, item, onClose }) => {
  if (!item) return null;
  const subject = `For you, ${contact?.name?.split(" ")[0] || "friend"}: ${item.title}`;
  const body = `Hi ${contact?.name?.split(" ")[0] || ""},\n\nThinking of our last conversation — I wanted to share this:\n\n${item.title}\n\n${item.body}\n\nHappy to chat about this anytime.\n\n— David`;
  return (
    <div className="send-modal-back" onClick={onClose}>
      <div className="send-modal" onClick={e => e.stopPropagation()}>
        <div className="send-modal-head">
          <div>
            <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:"var(--alpha-blue)", marginBottom:4}}>Send from library</div>
            <h3>{item.title}</h3>
          </div>
          <button className="btn-op ghost" onClick={onClose}><Icon.X/></button>
        </div>
        <div className="send-modal-body">
          <div className="field-op">
            <label>To</label>
            <input defaultValue={contact ? `${contact.name} · ${contact.email}` : "Pick a contact…"}/>
          </div>
          <div className="field-op">
            <label>Channel</label>
            <div style={{display:"flex", gap:8}}>
              <button className="f-chip active"><Icon.Mail/> Email</button>
              <button className="f-chip">SMS</button>
              <button className="f-chip">WhatsApp</button>
              <button className="f-chip">Copy link</button>
            </div>
          </div>
          <div className="field-op">
            <label>Subject</label>
            <input defaultValue={subject}/>
          </div>
          <div className="field-op">
            <label>Message <span style={{textTransform:"none", letterSpacing:0, fontWeight:500, color:"var(--ink-4)"}}>· personalize freely, link auto-tracked</span></label>
            <textarea defaultValue={body}/>
          </div>
          <div style={{display:"flex", gap:12, marginTop:8, paddingTop:18, borderTop:"1px solid var(--line)", alignItems:"center"}}>
            <label style={{fontSize:13, display:"flex", gap:8, alignItems:"center", color:"var(--ink-3)"}}>
              <input type="checkbox" defaultChecked/> Auto-log as "Sent FAQ" on {contact?.name?.split(" ")[0] || "contact"}
            </label>
            <div style={{flex:1}}/>
            <button className="btn-op" onClick={onClose}>Cancel</button>
            <button className="btn-op primary"><Icon.Send/> Send & log</button>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Events, PageBuilder, SendComposer });
