// Sidebar navigation
const Sidebar = ({ page, setPage, contactCount }) => {
  const items = [
    { id: "dashboard", icon: <Icon.Home/>, label: "Dashboard" },
    { id: "crm", icon: <Icon.Pipeline/>, label: "Pipeline", count: contactCount },
    { id: "library", icon: <Icon.Library/>, label: "Library" },
    { id: "events", icon: <Icon.Events/>, label: "Events" },
    { id: "page", icon: <Icon.Page/>, label: "My Page" },
  ];
  return (
    <aside className="champ-side">
      <Wordmark/>
      <div className="side-section">Workspace</div>
      {items.map(it => (
        <a key={it.id} className={`side-link ${page === it.id ? "active" : ""}`} onClick={() => setPage(it.id)}>
          {it.icon}
          <span>{it.label}</span>
          {it.count != null && <span className="count">{it.count}</span>}
        </a>
      ))}

      <div className="side-section">My Geography</div>
      <a className="side-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>Mississauga</span>
      </a>
      <a className="side-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <span>All Champions</span>
      </a>

      <div className="side-champion">
        <img src={CHAMPION.avatar} alt="" />
        <div className="info">
          <b>{CHAMPION.short}</b>
          <span>Champion · Mississauga</span>
        </div>
      </div>
    </aside>
  );
};

const PageBar = ({ crumb, title, actions, search }) => (
  <header className="page-bar">
    <div>
      {crumb && <div className="crumb">{crumb}</div>}
      <h1>{title}</h1>
    </div>
    <div className="spacer"/>
    {search !== false && <input className="search" placeholder="Search contacts, library, events…"/>}
    {actions}
  </header>
);

Object.assign(window, { Sidebar, PageBar });
