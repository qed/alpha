const { useState, useEffect, useMemo, useRef } = React;

const Icon = ({ name, size = 16 }) => {
  const icons = {
    quote: <path d="M3 8c0-2.5 2-4 4-4v2c-1 0-2 .5-2 2h2v4H3V8zm8 0c0-2.5 2-4 4-4v2c-1 0-2 .5-2 2h2v4h-4V8z" />,
    qa: <g><circle cx="6" cy="6" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" /></g>,
    article: <g><rect x="2" y="3" width="14" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M4 6h10M4 9h10M4 12h6" stroke="currentColor" strokeWidth="1.5" /></g>,
    close: <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
    plus: <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
    arrow: <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      {icons[name]}
    </svg>
  );
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status];
  return (
    <span className={`status-badge sb-${status}`}>
      <span className="dot" />
      {meta.label}
    </span>
  );
};

const DepthMarker = ({ depth }) => {
  const meta = DEPTH_META[depth];
  return (
    <span className="depth-marker">
      <span className="depth-marker-icon">
        <Icon name={meta.icon} size={12} />
      </span>
      {meta.label}
    </span>
  );
};

const ProgressPills = ({ status }) => {
  const idx = STATUS_ORDER.indexOf(status);
  return (
    <span className="progress-pills">
      {STATUS_ORDER.map((s, i) => (
        <span key={s} className={
          `pill ${i <= idx ? (s === 'committed' ? 'filled-sun' : 'filled') : ''}`
        } />
      ))}
      <span className="lbl">{STATUS_META[status].short}</span>
    </span>
  );
};

const Nav = () => (
  <nav className="nav">
    <div className="nav-inner">
      <a className="nav-brand" href="#">
        <img src="artifacts/Alpha Toronto.jpg" style={{ height: 40 }} alt="Alpha Toronto" />
        <div>
          <div className="tag">Parents Hub</div>
        </div>
      </a>
      <div className="nav-links">
        <a className="active">Stories</a>
        <a href="https://community.alpha.school/?ref=UFB2FW8LX" target="_blank" rel="noopener noreferrer">Community</a>
      </div>
      <div className="nav-right">
        <button className="btn btn-ghost btn-sm">Log in</button>
        <button className="btn btn-primary btn-sm">Join the hub</button>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <div className="community-hero">
    <div className="inner">
      <div className="hero-text-box">
        <h1>The families <em>behind</em> the families.</h1>
        <p className="lede">
          Before you tour, before you sign, before you move &mdash; hear from the parents who already did.
          Candid stories from Toronto families exploring, researching, committing to, and enrolled at Alpha.
        </p>
      </div>
      <div className="community-hero-stats">
        <div className="stat-cell">
          <span className="n">84</span>
          <span className="lbl">Families in the hub</span>
        </div>
        <div className="stat-cell">
          <span className="n">31</span>
          <span className="lbl">Stories shared</span>
        </div>
        <div className="stat-cell">
          <span className="n">12</span>
          <span className="lbl">Toronto neighbourhoods</span>
        </div>
        <div className="stat-cell">
          <span className="n">1<em>in</em>4</span>
          <span className="lbl">Referred by another hub family</span>
        </div>
      </div>
    </div>
  </div>
);

const Featured = ({ story, onOpen }) => (
  <div className="featured">
    <div className="featured-inner">
      <div className="featured-img" style={{ backgroundImage: `url('${story.studentImg}')` }}>
        <span className="depth-tag"><Icon name="article" size={12} /> Long read &middot; 6 min</span>
      </div>
      <div className="featured-content">
        <div className="eyebrow">Featured story &middot; {story.neighbourhood}</div>
        <h2>{story.title.split('.')[0]}<em>.</em>{story.title.split('.').slice(1).join('.')}</h2>
        <p className="pull">&ldquo;{story.pullQuote}&rdquo;</p>
        <div className="byline">
          <img src={story.parentImg} alt="" />
          <div>
            <b>{story.parent}</b>
            <div className="meta">{story.role} &middot; {story.neighbourhood}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => onOpen(story)}>
            Read the full story
          </button>
          <StatusBadge status={story.status} />
        </div>
      </div>
    </div>
  </div>
);

const ShortCard = ({ story, onOpen, statusViz }) => (
  <button className={`story-card depth-short st-${story.status}`} onClick={() => onOpen(story)}>
    <div className="card-media" style={{ backgroundImage: `url('${story.studentImg}')` }} />
    <div className="card-body">
      <div className="card-top-row">
        <DepthMarker depth="short" />
        {statusViz === 'progress' ? <ProgressPills status={story.status} /> : <StatusBadge status={story.status} />}
      </div>
      <p className="quote" style={{ marginTop: 18 }}>&ldquo;{story.quote}&rdquo;</p>
      {story.bigQuestion && (
        <div className="card-question">{story.bigQuestion}</div>
      )}
      <div className="family-line">
        <img src={story.parentImg} alt="" />
        <div className="fam">
          <b>{story.family}</b>
          <span className="meta">{story.neighbourhood} &middot; {story.grade}</span>
        </div>
      </div>
    </div>
  </button>
);

const QACard = ({ story, onOpen, statusViz }) => (
  <button className={`story-card depth-qa st-${story.status}`} onClick={() => onOpen(story)}>
    <div className="card-body">
      <div className="card-top-row">
        <DepthMarker depth="qa" />
        {statusViz === 'progress' ? <ProgressPills status={story.status} /> : <StatusBadge status={story.status} />}
      </div>
      <div className="qa-preview" style={{ marginTop: 18 }}>
        {story.qa.map((row, i) => (
          <div key={i} className="qa-row">
            <div className="qa-label">{i % 2 === 0 ? 'Q' : 'A'}.</div>
            <p className={`qa-text ${i % 2 === 0 ? 'q' : ''}`}>{row.q}</p>
          </div>
        ))}
        <div className="qa-row">
          <div className="qa-label">A.</div>
          <p className="qa-text" style={{ color: 'var(--ink-4)', fontStyle: 'italic' }}>
            &ldquo;{story.qa[0].a.slice(0, 80)}{story.qa[0].a.length > 80 ? '\u2026' : ''}&rdquo;
          </p>
        </div>
      </div>
      {story.bigQuestion && (
        <div className="card-question">{story.bigQuestion}</div>
      )}
      <div className="family-line">
        <img src={story.parentImg} alt="" />
        <div className="fam">
          <b>{story.family}</b>
          <span className="meta">{story.neighbourhood} &middot; {story.grade}</span>
        </div>
      </div>
    </div>
  </button>
);

const LongCard = ({ story, onOpen, statusViz }) => (
  <button className={`story-card depth-long st-${story.status}`} onClick={() => onOpen(story)}>
    <div className="card-media" style={{ backgroundImage: `url('${story.studentImg}')` }} />
    <div className="card-body">
      <div className="card-top-row">
        <DepthMarker depth="long" />
        {statusViz === 'progress' ? <ProgressPills status={story.status} /> : <StatusBadge status={story.status} />}
      </div>
      <h3 className="long-title">{story.title}</h3>
      <p className="long-excerpt">{story.excerpt}</p>
      {story.bigQuestion && (
        <div className="card-question" style={{ marginBottom: 14 }}>{story.bigQuestion}</div>
      )}
      <div className="family-line" style={{ borderTop: 'none', paddingTop: 0, marginTop: 'auto' }}>
        <img src={story.parentImg} alt="" />
        <div className="fam">
          <b>{story.parent} &middot; {story.family}</b>
          <span className="meta">{story.neighbourhood} &middot; {story.role}</span>
        </div>
        <span className="read-more" style={{ marginLeft: 'auto' }}>Read &rarr;</span>
      </div>
    </div>
  </button>
);

const StoryCard = ({ story, onOpen, statusViz }) => {
  if (story.depth === 'long') return <LongCard story={story} onOpen={onOpen} statusViz={statusViz} />;
  if (story.depth === 'qa') return <QACard story={story} onOpen={onOpen} statusViz={statusViz} />;
  return <ShortCard story={story} onOpen={onOpen} statusViz={statusViz} />;
};

const StatusLegend = () => (
  <div className="status-legend">
    <span className="lbl">The journey</span>
    {STATUS_ORDER.map(s => (
      <span key={s} className="leg-item">
        <StatusBadge status={s} />
        <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{STATUS_META[s].desc}</span>
      </span>
    ))}
  </div>
);

const Feed = ({ stories, onOpen, layout, statusViz }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');

  const counts = useMemo(() => {
    const c = { all: stories.length };
    STATUS_ORDER.forEach(s => {
      c[s] = stories.filter(x => x.status === s).length;
    });
    return c;
  }, [stories]);

  const grades = useMemo(() => {
    const all = new Set();
    stories.forEach(s => s.grade.split(',').map(g => g.trim()).forEach(g => all.add(g)));
    return ['all', ...Array.from(all)];
  }, [stories]);

  const filtered = stories.filter(s => {
    const statusOk = statusFilter === 'all' || s.status === statusFilter;
    const gradeOk = gradeFilter === 'all' || s.grade.split(',').map(g => g.trim()).includes(gradeFilter);
    return statusOk && gradeOk;
  });

  return (
    <div className="feed-section">
      <div className="feed-head">
        <div>
          <div className="eyebrow">Parent stories</div>
          <h2>All <em>{filtered.length}</em> stories, filtered to yours.</h2>
        </div>
        <div className="results-line">
          Showing <b>{filtered.length}</b> of <b>{stories.length}</b> families
        </div>
      </div>

      <StatusLegend />

      <div className="feed-toolbar">
        <div className="filter-group">
          <span className="lbl">Status</span>
          <button className={`chip ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>
            All <span className="count">{counts.all}</span>
          </button>
          {STATUS_ORDER.map(s => (
            <button key={s} className={`chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
              <span className={`dot status-dot-${s}`} />
              {STATUS_META[s].label}
              <span className="count">{counts[s]}</span>
            </button>
          ))}
        </div>
        <div className="filter-group">
          <span className="lbl">Grade</span>
          <select className="grade-select" value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}>
            {grades.map(g => (
              <option key={g} value={g}>{g === 'all' ? 'All grades' : g}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={`feed-grid ${layout} sv-${statusViz}`}>
        {filtered.map(story => (
          <StoryCard key={story.id} story={story} onOpen={onOpen} statusViz={statusViz} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--ink-4)' }}>
          <p style={{ fontSize: 18, marginBottom: 12 }}>No stories match those filters.</p>
          <button className="btn btn-ghost" onClick={() => { setStatusFilter('all'); setGradeFilter('all'); }}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

const StoryModal = ({ story, onClose }) => {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!story) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </button>
        <div className="modal-hero" style={{ backgroundImage: `url('${story.studentImg}')` }}>
          <div className="chips">
            <StatusBadge status={story.status} />
            <span className="depth-tag" style={{
              position: 'static',
              background: 'rgba(255,255,255,0.95)',
              padding: '6px 12px',
              borderRadius: 999,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Icon name={DEPTH_META[story.depth].icon} size={10} />
              {DEPTH_META[story.depth].label}
            </span>
          </div>
        </div>
        <div className="modal-body">
          <div className="eyebrow">{story.family} &middot; {story.neighbourhood}</div>
          <h2>
            {story.title
              ? <>{story.title}</>
              : <>&ldquo;<em>{story.quote}</em>&rdquo;</>
            }
          </h2>
          {story.subtitle && (
            <p className="lead">{story.subtitle}</p>
          )}
          <div className="modal-byline">
            <img src={story.parentImg} alt="" />
            <div>
              <b>{story.parent}</b>
              <div className="meta">{story.role}</div>
            </div>
            <div className="spacer" />
            <div style={{ fontSize: 12, color: 'var(--ink-4)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
              {story.enrolledSince}
            </div>
          </div>

          <div className="modal-qa">
            <div className="q-row">
              <div className="q-lbl">How they found us</div>
              <p className="q-q">{story.howConnected}</p>
            </div>
            <div className="q-row">
              <div className="q-lbl">Why Alpha</div>
              <p className="q-q">{story.whyInterested}</p>
            </div>
          </div>

          {story.depth === 'long' && story.body && story.body.map((block, i) => {
            if (block.type === 'p') return <p key={i}>{block.text}</p>;
            if (block.type === 'h') return <h3 key={i} className="section-head">{block.text}</h3>;
            if (block.type === 'quote') return <blockquote key={i}>&ldquo;{block.text}&rdquo;</blockquote>;
            return null;
          })}

          {story.depth === 'qa' && story.qa && (
            <div style={{ margin: '24px 0' }}>
              {story.qa.map((row, i) => (
                <div key={i} style={{ marginBottom: 28 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12,
                    letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--alpha-blue)',
                    marginBottom: 8
                  }}>Question {i + 1}</div>
                  <h3 className="section-head" style={{ margin: '0 0 10px', fontSize: 22 }}>{row.q}</h3>
                  <p>{row.a}</p>
                </div>
              ))}
            </div>
          )}

          {story.depth === 'short' && (
            <p className="lead" style={{ marginTop: 16 }}>{story.excerpt}</p>
          )}

          {story.bigQuestion && (
            <div className="big-question-card">
              <div className="eyebrow">Their biggest question about Alpha</div>
              <p className="q">&ldquo;{story.bigQuestion}&rdquo;</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
            <button className="btn btn-primary">Message {story.parent.split(' ')[0]}</button>
            <button className="btn btn-secondary" onClick={onClose}>Back to stories</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQ = ({ onOpenStory }) => {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <div className="faq-section">
      <div className="faq-inner">
        <div className="faq-head">
          <div>
            <div className="eyebrow">The questions we all ask</div>
            <h2>Every family <em>walks in</em> with the same six questions.</h2>
          </div>
          <p>
            Drawn directly from what hub families asked at their first Parent Lab &mdash;
            and the candid answers that came back from parents further along the journey.
          </p>
        </div>
        <div className="faq-grid">
          {FAQ_ITEMS.map((item, i) => {
            const askers = item.askedBy.map(id => STORIES.find(s => s.id === id)).filter(Boolean);
            const open = openIdx === i;
            return (
              <div key={i} className={`faq-item ${open ? 'open' : ''}`}>
                <button className="faq-trigger" onClick={() => setOpenIdx(open ? -1 : i)}>
                  <span className="q-num">0{i + 1}</span>
                  <span className="q-text">{item.q}</span>
                  <span className="q-icon"><Icon name="plus" size={12} /></span>
                </button>
                {open && (
                  <div className="faq-body">
                    <p style={{ margin: 0 }}>{item.a}</p>
                    <div className="askers">
                      <div className="avs">
                        {askers.slice(0, 3).map(a => (
                          <img key={a.id} src={a.parentImg} alt="" title={a.family} />
                        ))}
                      </div>
                      <span className="count-text">
                        Asked by <b style={{ color: 'var(--ink-2)' }}>{askers.map(a => a.family.replace('The ', '').replace(' Family', '')).join(', ')}</b>
                        {item.count > askers.length && ` + ${item.count - askers.length} other families`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ShareCTA = () => (
  <div className="share-cta">
    <div className="inner">
      <div className="eyebrow">Your turn</div>
      <h2>You've read ours. Tell us <em>yours</em>.</h2>
      <p>
        Whether you're one Instagram ad in or three years enrolled &mdash; your story helps the next family
        figure out whether Alpha is their shape. Fifteen minutes. We'll do the writing.
      </p>
      <div className="btn-stack">
        <button className="btn-light">Share your story</button>
        <button className="btn-ghost-light">Come to a Parent Lab first</button>
      </div>
    </div>
  </div>
);

const Footer = () => (
  <footer className="footer">
    <div className="footer-inner">
      <div>
        <img src="artifacts/Alpha Toronto.jpg" style={{ height: 50, marginBottom: 20, borderRadius: 4, background: '#fff', padding: 4 }} alt="Alpha Toronto" />
        <p style={{ color: 'var(--alpha-sky)', fontSize: 14, maxWidth: '38ch', lineHeight: 1.5, margin: 0 }}>
          An unofficial community hub for Alpha School families in the GTA. Not operated by Alpha School.
        </p>
      </div>
      <div>
        <h5>Hub</h5>
        <a>Events</a><a>Parent Lab</a><a>Resources</a><a>Stories</a>
      </div>
      <div>
        <h5>Learn</h5>
        <a>About Alpha</a><a>2hr Learning</a><a>Life skills</a>
      </div>
      <div>
        <h5>Connect</h5>
        <a>Email list</a><a>WhatsApp</a><a>Contact</a>
      </div>
    </div>
    <div className="foot-end">
      <span>&copy; 2026 Alpha Parents Hub</span>
      <span>Toronto, ON</span>
    </div>
  </footer>
);
