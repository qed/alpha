// Library — faceted (filter sidebar + grid) and feed (centered editorial column)
const Library = ({ layout = "faceted", openSend }) => {
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [concernFilter, setConcernFilter] = React.useState("all");

  const filtered = LIBRARY.filter(l =>
    (typeFilter === "all" || l.type === typeFilter) &&
    (concernFilter === "all" || l.concern === concernFilter)
  );

  const types = [
    { id: "faq", label: "FAQs" },
    { id: "quote", label: "Testimonials" },
    { id: "talking", label: "Talking points" },
    { id: "data", label: "Data & reports" },
  ];
  const concerns = [...new Set(LIBRARY.map(l => l.concern))];

  if (layout === "feed") {
    return (
      <div>
        <div className="filter-row" style={{justifyContent:"center"}}>
          <span className="f-label">Type</span>
          <button className={`f-chip ${typeFilter === "all" ? "active" : ""}`} onClick={() => setTypeFilter("all")}>All</button>
          {types.map(t => (
            <button key={t.id} className={`f-chip ${typeFilter === t.id ? "active" : ""}`} onClick={() => setTypeFilter(t.id)}>{t.label}</button>
          ))}
        </div>
        <div className="lib-grid feed-mode">
          {filtered.map((l, i) => <FeedCard key={l.id} item={l} num={i+1} openSend={openSend}/>)}
        </div>
      </div>
    );
  }

  return (
    <div className="lib-layout">
      <aside className="lib-facets">
        <div className="group">
          <h5>Type</h5>
          <div className={`check-row ${typeFilter === "all" ? "on" : ""}`} onClick={() => setTypeFilter("all")}>
            <span>All</span><span className="ct">{LIBRARY.length}</span>
          </div>
          {types.map(t => {
            const ct = LIBRARY.filter(l => l.type === t.id).length;
            return (
              <div key={t.id} className={`check-row ${typeFilter === t.id ? "on" : ""}`} onClick={() => setTypeFilter(t.id)}>
                <span>{t.label}</span><span className="ct">{ct}</span>
              </div>
            );
          })}
        </div>
        <div className="group">
          <h5>Addresses Concern</h5>
          <div className={`check-row ${concernFilter === "all" ? "on" : ""}`} onClick={() => setConcernFilter("all")}>
            <span>Any</span>
          </div>
          {concerns.map(c => {
            const ct = LIBRARY.filter(l => l.concern === c).length;
            return (
              <div key={c} className={`check-row ${concernFilter === c ? "on" : ""}`} onClick={() => setConcernFilter(c)}>
                <span>{c}</span><span className="ct">{ct}</span>
              </div>
            );
          })}
        </div>
        <div className="group">
          <h5>Sort</h5>
          <div className="check-row on"><span>Most sent</span></div>
          <div className="check-row"><span>Most helpful</span></div>
          <div className="check-row"><span>Recently added</span></div>
        </div>
      </aside>
      <div className="lib-grid">
        {filtered.map(l => <GridCard key={l.id} item={l} openSend={openSend}/>)}
      </div>
    </div>
  );
};

const GridCard = ({ item, openSend }) => (
  <div className={`lib-card t-${item.type}`} onClick={() => openSend(null, item)}>
    <div className="typ">{item.typeLabel}</div>
    {item.type === "quote" ? (
      <>
        <div className="quote-body">"{item.body}"</div>
        <div style={{fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--font-display)", fontWeight: 600}}>— {item.author}</div>
      </>
    ) : (
      <>
        <h4>{item.title}</h4>
        <div className="body">{item.body}</div>
      </>
    )}
    <div className="foot">
      <div className="meta">
        <span>{item.sends} sends</span>
        <span>·</span>
        <span>{item.helpfulness}% helpful</span>
      </div>
      <button className="send-btn" onClick={(e) => { e.stopPropagation(); openSend(null, item); }}>Send →</button>
    </div>
  </div>
);

const FeedCard = ({ item, num, openSend }) => (
  <div className={`lib-card t-${item.type}`}>
    <div className="num-col">{String(num).padStart(2, "0")}</div>
    <div>
      <div className="typ">{item.typeLabel}</div>
      {item.type === "quote" ? (
        <div className="quote-body" style={{fontSize: 22}}>"{item.body}"</div>
      ) : (
        <>
          <h4 style={{fontSize: 22}}>{item.title}</h4>
          <div className="body" style={{fontSize: 14}}>{item.body}</div>
        </>
      )}
      <div className="foot" style={{marginTop: 12}}>
        <div className="meta">
          <span>{item.author}</span>
          <span>·</span>
          <span>{item.sends} sends</span>
          <span>·</span>
          <span>{item.helpfulness}% helpful</span>
        </div>
        <button className="send-btn" onClick={() => openSend(null, item)}>Send →</button>
      </div>
    </div>
  </div>
);

Object.assign(window, { Library });
