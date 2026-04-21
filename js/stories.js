const STORIES = [
  {
    id: 'lee',
    status: 'enrolled',
    depth: 'long',
    family: 'The Lee Family',
    parent: 'Jenna Lee',
    role: 'Mom of Kai (L1)',
    neighbourhood: 'Rosedale',
    grade: 'L1',
    studentImg: 'assets/student-kai.webp',
    parentImg: 'assets/guide-stefanie.webp',
    enrolledSince: 'Sep 2025',
    title: 'We moved from a top-ranked private school. No regrets.',
    subtitle: 'What finally convinced a Bay Street mom that 2 hours of academics was enough.',
    excerpt: "Kai was bored. Straight-A report cards, gifted stream, and yet every Sunday night he'd complain about Monday. We didn't want a new school \u2014 we wanted a new relationship with learning.",
    pullQuote: "Three months in, he's asking for more math at the dinner table. That never happened before.",
    body: [
      { type: 'p', text: "We did three tours of top-tier private schools in 2024. Everyone said the right things about individualized learning, leadership, character. Then we met a Parents Hub family at a birthday party and our whole frame of reference broke." },
      { type: 'p', text: "The pitch sounded too good: two hours of core academics in the morning, the rest of the day on workshops, life skills, and passion projects. My husband is a partner at a law firm. His first reaction was 'that's not enough.'" },
      { type: 'h', text: "The one-week trial did it" },
      { type: 'p', text: "Alpha ran us through a simulated week with Kai. He worked on the learning apps, met the guides, did a Saturday life-skills workshop on entrepreneurship. On day three, he told us he was 'done with Tuesday's work.' We didn't believe him until we saw the dashboard." },
      { type: 'quote', text: "The biggest shift for us wasn't academic. It was watching him own his own time." },
      { type: 'p', text: "Six months in, Kai is tracking about 2.2x the pace of his previous school. But the real thing \u2014 the thing I couldn't have predicted \u2014 is that he's started reading for fun again. He picked up Project Hail Mary last weekend without being asked. That's the win." }
    ],
    bigQuestion: "How do I know my kid is actually learning if there's no teacher in front of the class?",
    howConnected: 'Birthday party conversation with another Alpha parent',
    whyInterested: 'Our son was bored in the gifted stream at his old school'
  },
  {
    id: 'okonkwo',
    status: 'enrolled',
    depth: 'short',
    family: 'The Okonkwo-Reid Family',
    parent: 'Amara Okonkwo & David Reid',
    role: 'Parents of Shepard (L1) & Chloe (L2)',
    neighbourhood: 'Leaside',
    grade: 'L1, L2',
    studentImg: 'assets/student-shepard.webp',
    parentImg: 'assets/guide-joshua.jpg',
    enrolledSince: 'Sep 2024',
    quote: "We stopped fighting about homework. The kids run their own mornings. I got my weeknights back.",
    excerpt: "Dual-career household. Both kids enrolled. The most surprising gain wasn't academic \u2014 it was bedtime.",
    bigQuestion: "What happens to socialization if they're on apps two hours a day?",
    howConnected: 'Saw a LinkedIn post from an Alpha Austin parent',
    whyInterested: 'Homework was destroying our evenings'
  },
  {
    id: 'mathews',
    status: 'enrolled',
    depth: 'qa',
    family: 'The Mathews Family',
    parent: 'Priya Mathews',
    role: 'Mom of Rosie (L2)',
    neighbourhood: 'High Park',
    grade: 'L2',
    studentImg: 'assets/student-rosie.webp',
    parentImg: 'assets/guide-stefanie.webp',
    enrolledSince: 'Jan 2026',
    qa: [
      { q: "What made you commit?", a: "Rosie cried on the last day of the trial week. I'd never seen her cry about school in a good way." },
      { q: "Biggest surprise?", a: "She now teaches me things at dinner. Spanish verbs, how Khanmigo explains fractions. The flow reversed." }
    ],
    excerpt: "Mid-year switch from French immersion.",
    bigQuestion: "Will she keep up French? We worked so hard on it for five years.",
    howConnected: 'Google search that led to an open house',
    whyInterested: 'She was ahead of her class by a full year and stagnating'
  },
  {
    id: 'patel',
    status: 'enrolled',
    depth: 'qa',
    family: 'The Patel Family',
    parent: 'Anjali & Raj Patel',
    role: 'Parents of Silas (L1)',
    neighbourhood: 'Forest Hill',
    grade: 'L1',
    studentImg: 'assets/student-silas.webp',
    parentImg: 'assets/guide-liam.webp',
    enrolledSince: 'Sep 2025',
    qa: [
      { q: "Why Alpha over MaRS or UCC?", a: "We liked the accountability. The dashboard shows us exactly where Silas is. No more guessing from term reports." },
      { q: "What's working?", a: "Workshop model. He's built three small projects so far. One of them is a chess tutor for his little sister." }
    ],
    excerpt: "Tech-industry parents who wanted transparency.",
    bigQuestion: "Is the pace sustainable, or will he burn out by grade 6?",
    howConnected: 'My spouse knew a founder who used Alpha for their kids in Austin',
    whyInterested: "We wanted data, not vibes, about our kid's learning"
  },
  {
    id: 'wang',
    status: 'committed',
    depth: 'long',
    family: 'The Wang Family',
    parent: 'Michelle Wang',
    role: 'Mom of Marshall (starting L1 in Sep)',
    neighbourhood: 'North York',
    grade: 'L1',
    studentImg: 'assets/student-marshall.webp',
    parentImg: 'assets/guide-liam.webp',
    enrolledSince: 'Starts Sep 2026',
    title: "We signed the paperwork last Tuesday. Here's what tipped it.",
    subtitle: 'After nine months of diligence, a single Saturday workshop made the decision.',
    excerpt: "Engineers overthink things. We had a spreadsheet comparing six schools across 14 criteria. None of it mattered as much as watching Marshall at the life-skills day.",
    pullQuote: "He didn't want to leave. That's all the data I needed.",
    body: [
      { type: 'p', text: "I research like it's my job \u2014 because it is. Before we visited Alpha, I'd read every article, every skeptic take, every Twitter thread about 2hr Learning. I came in ready to poke holes." },
      { type: 'p', text: "The pitch held up. Guides explained the model without jargon. Parents were candid about trade-offs (yes, your kid will know how to use an iPad; no, they won't become a screen zombie). The apps have real pedagogy behind them." },
      { type: 'h', text: "The moment" },
      { type: 'p', text: "We brought Marshall to a Saturday life-skills workshop on public speaking. Eight kids, two parent-volunteers, zero formality. He gave a 90-second pitch about why Pok\u00e9mon cards are undervalued investments. He was seven. The other kids gave feedback. He iterated. He did it again." },
      { type: 'p', text: "On the drive home he asked when he could go back. He has never asked that about school." }
    ],
    bigQuestion: "What if he starts and we realize it's not working \u2014 how hard is it to pivot back to a traditional school?",
    howConnected: 'Found Parents Hub through the events calendar',
    whyInterested: 'We wanted to front-load life skills, not stack them as afterthoughts'
  },
  {
    id: 'becker',
    status: 'committed',
    depth: 'short',
    family: 'The Becker Family',
    parent: 'Sarah Becker',
    role: 'Mom of twins starting L1',
    neighbourhood: 'The Beaches',
    grade: 'L1',
    studentImg: 'assets/student-chloe.webp',
    parentImg: 'assets/guide-stefanie.webp',
    enrolledSince: 'Starts Sep 2026',
    quote: "Two kids, two learning styles, one classroom that finally fits both. Signed on the spot.",
    excerpt: "Twin boys \u2014 one kinesthetic learner, one very academic. The personalized pacing solved both.",
    bigQuestion: "Will they compare their progress and get competitive with each other?",
    howConnected: 'Parents Hub Instagram',
    whyInterested: 'Twins learn at different speeds. Traditional class = one of them always bored.'
  },
  {
    id: 'nguyen',
    status: 'researching',
    depth: 'qa',
    family: 'The Nguyen Family',
    parent: 'Linh Nguyen',
    role: 'Mom of a 5-year-old',
    neighbourhood: 'Liberty Village',
    grade: 'Pre-K',
    studentImg: 'assets/student-rosie.webp',
    parentImg: 'assets/guide-stefanie.webp',
    enrolledSince: 'Touring spring 2026',
    qa: [
      { q: "Where are you in the process?", a: "We've done two Parent Labs and one school tour. Still comparing with a Montessori option." },
      { q: "What's the holdup?", a: "Honestly, cost. The tuition isn't in our range without moving some things around. Trying to figure out if it's worth the stretch." }
    ],
    excerpt: "Montessori vs. Alpha. Budget constraints real.",
    bigQuestion: "Is the premium over a good Montessori actually worth it for a 5-year-old?",
    howConnected: 'Friend from work mentioned it',
    whyInterested: 'Daughter is reading at a grade 2 level and we need pacing that matches'
  },
  {
    id: 'chen-park',
    status: 'researching',
    depth: 'short',
    family: 'The Chen-Park Family',
    parent: 'Jessica Chen',
    role: 'Mom of an 8-year-old',
    neighbourhood: 'Yonge & Eglinton',
    grade: 'L1',
    studentImg: 'assets/student-chloe.webp',
    parentImg: 'assets/guide-liam.webp',
    enrolledSince: 'Researching',
    quote: "I'm obsessed and terrified in equal measure. Every parent I talk to is a true believer, which makes me suspicious.",
    excerpt: "Skeptical-but-curious. Looking for dissenting opinions.",
    bigQuestion: "Where are the families who left Alpha? I want to hear from them, not just the evangelists.",
    howConnected: 'The Walrus article',
    whyInterested: "My son is quietly miserable at a 'good' public school"
  },
  {
    id: 'ogunwole',
    status: 'researching',
    depth: 'long',
    family: 'The Ogunwole Family',
    parent: 'Tunde Ogunwole',
    role: 'Dad of Ayo (age 6) and Zuri (age 9)',
    neighbourhood: 'Scarborough',
    grade: 'Pre-K, L2',
    studentImg: 'assets/student-shepard.webp',
    parentImg: 'assets/guide-joshua.jpg',
    enrolledSince: 'Researching since Nov 2025',
    title: 'I was the parent yelling in the Parent Lab. They invited me back.',
    subtitle: "A dad's candid account of being the loudest skeptic in the room.",
    excerpt: "I showed up to the Parent Lab with my arms crossed. Two hours of academics? No teachers in the room? This sounded like a Silicon Valley experiment being run on our kids. I said so \u2014 out loud.",
    pullQuote: "They didn't flinch. They handed me the dashboard login and said 'test it yourself for a week.' So I did.",
    body: [
      { type: 'p', text: "My wife dragged me. I came from a Nigerian household where school meant uniforms, rote learning, and teachers you feared. The idea of kids learning from apps felt fundamentally un-serious." },
      { type: 'p', text: "At the Parent Lab I asked what I thought were gotcha questions. How do you prevent cheating on the apps? What if my kid just clicks through? Who's watching the social-emotional stuff? The guide \u2014 young, patient \u2014 answered each one with receipts. Studies. Screenshots. Names of kids." },
      { type: 'h', text: "Still researching" },
      { type: 'p', text: "We're not there yet. My two kids are different. Zuri is academic, Ayo is a ball of chaos. I'm trying to figure out if the model works for both. We've scheduled a second tour where Ayo can do a half-day." },
      { type: 'p', text: "But I'm no longer the loudest skeptic. I'm the most thorough one." }
    ],
    bigQuestion: "How does the model handle a kid who's genuinely not self-motivated? My oldest would thrive, but my youngest might just play all day.",
    howConnected: 'Wife found the hub through a moms-of-Scarborough Facebook group',
    whyInterested: 'I want to push back on the model before I trust it with my kids'
  },
  {
    id: 'dubois',
    status: 'exploring',
    depth: 'short',
    family: 'The DuBois Family',
    parent: 'Claire DuBois',
    role: 'Mom of a 4-year-old',
    neighbourhood: 'The Annex',
    grade: 'Pre-K',
    studentImg: 'assets/student-kai.webp',
    parentImg: 'assets/guide-stefanie.webp',
    enrolledSince: 'Exploring',
    quote: "I don't even know what 2hr Learning is yet. Found this hub last week. Wanted to know what other parents think before I book a tour.",
    excerpt: "Very early. Here to lurk and learn.",
    bigQuestion: "Is this actually accredited? Will it transfer if we move?",
    howConnected: 'Instagram ad',
    whyInterested: "Daycare ends next year and we need to decide where he'll start"
  },
  {
    id: 'thompson',
    status: 'exploring',
    depth: 'qa',
    family: 'The Thompson Family',
    parent: 'Michael Thompson',
    role: 'Dad of two (ages 10 and 12)',
    neighbourhood: 'Etobicoke',
    grade: 'L2, MS',
    studentImg: 'assets/student-silas.webp',
    parentImg: 'assets/guide-joshua.jpg',
    enrolledSince: 'Exploring',
    qa: [
      { q: "What brought you here?", a: "My 12yo said school is 'mid.' My 10yo said it's 'worse than mid.' I googled alternatives and ended up at the Parents Hub." },
      { q: "What do you want to learn?", a: "Whether switching mid-elementary is crazy. And whether my 12yo is already too old for this to work." }
    ],
    excerpt: "Public school parent, kids say school is 'mid.'",
    bigQuestion: "Is it too late to switch kids at ages 10 and 12, or is the model actually better for older kids who can drive their own learning?",
    howConnected: "Googled 'Toronto alternative school'",
    whyInterested: 'Kids have checked out of traditional school'
  }
];

const STATUS_META = {
  exploring:    { label: 'Exploring',    short: 'Exploring',    desc: 'Just learning what Alpha is',   color: '#6B6B76' },
  researching:  { label: 'Researching',  short: 'Researching',  desc: 'Touring, comparing, reading',   color: '#0000FF' },
  committed:    { label: 'Committed',    short: 'Committed',    desc: 'Signed & waiting to start',     color: '#B98800' },
  enrolled:     { label: 'Enrolled',     short: 'Enrolled',     desc: 'Kids are in. Lived experience.', color: '#0000FF' }
};

const STATUS_ORDER = ['exploring', 'researching', 'committed', 'enrolled'];

const DEPTH_META = {
  short: { label: 'Quick take', icon: 'quote' },
  qa:    { label: 'Q & A',      icon: 'qa' },
  long:  { label: 'Long read',  icon: 'article' }
};

const FAQ_ITEMS = [
  {
    q: "How do I know my kid is actually learning if there's no teacher in front of the class?",
    a: "Every student has a live dashboard showing minutes practiced, mastery level, and time-on-app per subject. Guides review progress weekly and parents get a Friday report. The signal is cleaner than a report card, because it's measured daily, not monthly.",
    askedBy: ['lee', 'ogunwole'],
    count: 47
  },
  {
    q: "What about socialization if they're on apps two hours a day?",
    a: "The other 4+ hours are group workshops, life skills, and peer projects. Students typically spend less time on screens than at a traditional school \u2014 they just do it more efficiently in the morning block.",
    askedBy: ['okonkwo', 'dubois'],
    count: 38
  },
  {
    q: "Is it too late to switch mid-elementary?",
    a: "Most Toronto families switch between L1 and L2. The trickier window is Grade 7+ \u2014 older kids need to actively want the switch. Hub parents report mid-year transitions work best when the kid has spent at least one full Saturday workshop first.",
    askedBy: ['thompson', 'mathews'],
    count: 29
  },
  {
    q: "Is this accredited? Will credits transfer?",
    a: "Alpha School is accredited through Cognia. Credits transfer to most Ontario public and private schools. For university, Alpha graduates have been accepted to U of T, McGill, Waterloo, and 40+ U.S. universities.",
    askedBy: ['dubois'],
    count: 26
  },
  {
    q: "What if my kid is genuinely not self-motivated?",
    a: "This is the most common parent fear and the one guides address most often. The model has a reward economy (think: points for effort, not just outcomes). Families who struggled most in year one are typically those where parents didn't attend a Parent Lab.",
    askedBy: ['ogunwole'],
    count: 24
  },
  {
    q: "How much does it cost \u2014 really?",
    a: "Tuition for 2026\u201327 is published on alpha.school. There are sibling discounts and a modest need-based aid pool. The Parents Hub runs an info session on financing options every quarter.",
    askedBy: ['nguyen'],
    count: 22
  }
];
