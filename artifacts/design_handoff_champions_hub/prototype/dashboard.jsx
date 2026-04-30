// Champion Dashboard — landing screen
// Hero: deposit thermometer (private to champion's geography)
// Briefing: today's plan (3 contacts to follow up, 1 library refresh, 1 event)
// KPI strip + Mississauga thermometer + briefing + recent activity

const Dashboard = ({ goToContact, setPage }) => {
  const deposited = CONTACTS.filter(c => c.stage === "committed" || c.stage === "enrolled").length;
  const target = 25;
  const interested = CONTACTS.filter(c => c.stage === "interested").length;
  const shadow = CONTACTS.filter(c => c.stage === "shadow-day").length;

  // Today's briefing: 3 hottest contacts that haven't been touched in a while
  const followups = [...CONTACTS]
    .filter(c => c.stage !== "committed" && c.stage !== "enrolled" && c.stage !== "lost")
    .sort((a, b) => (b.heat * 4 + b.daysSince) - (a.heat * 4 + a.daysSince))
    .slice(0, 4);

  return (
    <div>
      <div className="legend-banner">
        <span className="lbl">Legend</span>
        <span className="item"><span className="swatch shipped"></span>Already in codebase (prospects, stages, notes, follow-up dates)</span>
        <span className="item"><span className="swatch proposed"></span>Proposed in v1: Co-pilot, heat score, concerns, signals, library send, page builder</span>
      </div>

      <div className="kpi-row">
        <div className="kpi featured">
          <div className="k">Deposits</div>
          <div className="v">{deposited}<em>/{target}</em></div>
          <div className="d"><b>+2</b> in the last 14 days</div>
        </div>
        <div className="kpi">
          <div className="k">Active Pipeline</div>
          <div className="v">{interested + shadow}</div>
          <div className="d">{interested} interested · {shadow} shadow day</div>
        </div>
        <div className="kpi">
          <div className="k">Total Contacts</div>
          <div className="v">112</div>
          <div className="d"><b>+8</b> since Oct 1</div>
        </div>
        <div className="kpi">
          <div className="k">Streak</div>
          <div className="v">21<em>d</em></div>
          <div className="d">Days with at least one logged action</div>
        </div>
      </div>

      <div className="thermo">
        <div className="row">
          <div className="left">
            <div className="eyebrow">Mississauga · Port Credit Campus</div>
            <h2>Toward <em>opening day.</em></h2>
          </div>
          <div className="right">
            <div className="big">{deposited}<em>/{target}</em></div>
            <div className="sub">Deposits · {target - deposited} to go</div>
          </div>
        </div>
        <div className="thermo-bar">
          <div className="thermo-bar-fill" style={{ width: `${(deposited/target)*100}%` }}></div>
        </div>
        <div className="thermo-ticks">
          <span>0</span><span>5</span><span>10</span><span>15</span><span>20</span><span>{target} · open</span>
        </div>
      </div>

      <div className="briefing">
        <div className="briefing-head">
          <Icon.Sparkle/>
          <div>
            <div className="date">Tuesday, November 4 · Today's Briefing</div>
          </div>
          <div style={{flex: 1}}/>
          <span className="sub">Generated 6:42am</span>
        </div>
        <div className="briefing-grid">
          <div className="briefing-cell">
            <h5>3 Follow-ups</h5>
            {followups.slice(0, 3).map(c => (
              <div className="brief-item" key={c.id} onClick={() => goToContact(c.id)}>
                <div className="av">{c.avatar}</div>
                <div className="info">
                  <b>{c.name}</b>
                  <div className="why">
                    Heat {c.heat}/5 · {c.daysSince}d since touch · {STAGES.find(s => s.id === c.stage).label}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="briefing-cell">
            <h5>1 Refresh</h5>
            <div className="brief-item" onClick={() => setPage("library")}>
              <div className="av" style={{background: "var(--alpha-coral)", color: "#fff"}}>📖</div>
              <div className="info">
                <b>Brownsville outcomes report</b>
                <div className="why">Updated last week · Marcus & Lena ask data questions</div>
              </div>
            </div>
            <h5 style={{marginTop: 16}}>1 Event Reminder</h5>
            <div className="brief-item" onClick={() => setPage("events")}>
              <div className="av" style={{background: "var(--alpha-sun)", color: "var(--ink)"}}>22</div>
              <div className="info">
                <b>Saturday Workshop · Nov 22</b>
                <div className="why">17 / 25 RSVP'd · 4 of yours not yet invited</div>
              </div>
            </div>
          </div>
          <div className="briefing-cell">
            <h5>Watch</h5>
            <div className="brief-item">
              <div className="av" style={{background: "#FFE4B0", color: "#6A4A00"}}>!</div>
              <div className="info">
                <b>Aleksandra W. cooling off</b>
                <div className="why">21 days since touch, no signals. Last attempt or move on.</div>
              </div>
            </div>
            <div className="brief-item">
              <div className="av" style={{background: "#DCFCE7", color: "#065F36"}}>↑</div>
              <div className="info">
                <b>Joon-ho L. warming up</b>
                <div className="why">Asked for 1:1 last week. Bump to interested.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="panel-op">
          <div className="panel-op-head">
            <h3>Pipeline by stage</h3>
            <div className="spacer"/>
            <button className="btn-op sm ghost" onClick={() => setPage("crm")}>Open Pipeline →</button>
          </div>
          <div style={{padding: "20px 24px"}}>
            {STAGES.map(s => {
              const ct = CONTACTS.filter(c => c.stage === s.id).length;
              const max = Math.max(...STAGES.map(st => CONTACTS.filter(c => c.stage === st.id).length));
              return (
                <div key={s.id} style={{display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: "1px solid var(--line-2)"}}>
                  <StagePill stage={s.id}/>
                  <div style={{flex: 1, height: 8, background: "var(--paper-3)", borderRadius: 999, overflow: "hidden"}}>
                    <div style={{
                      width: `${max ? (ct/max)*100 : 0}%`,
                      height: "100%",
                      background: s.id === "committed" || s.id === "enrolled" ? "var(--alpha-blue)" : s.id === "lost" ? "var(--ink-4)" : "var(--ink-3)",
                      borderRadius: 999
                    }}/>
                  </div>
                  <div style={{fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em", minWidth: 30, textAlign: "right"}}>
                    {ct}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel-op">
          <div className="panel-op-head">
            <h3>This week</h3>
          </div>
          <div style={{padding: "16px 24px"}}>
            <div style={{display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--line-2)"}}>
              <span style={{fontSize: 13, color: "var(--ink-3)"}}>1:1 conversations logged</span>
              <b style={{fontFamily: "var(--font-display)"}}>4</b>
            </div>
            <div style={{display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--line-2)"}}>
              <span style={{fontSize: 13, color: "var(--ink-3)"}}>Library sends</span>
              <b style={{fontFamily: "var(--font-display)"}}>11</b>
            </div>
            <div style={{display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--line-2)"}}>
              <span style={{fontSize: 13, color: "var(--ink-3)"}}>Stage changes</span>
              <b style={{fontFamily: "var(--font-display)"}}>3</b>
            </div>
            <div style={{display: "flex", justifyContent: "space-between", padding: "10px 0"}}>
              <span style={{fontSize: 13, color: "var(--ink-3)"}}>New contacts added</span>
              <b style={{fontFamily: "var(--font-display)"}}>2</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Dashboard });
