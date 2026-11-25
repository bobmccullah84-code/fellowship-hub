// Statement of Faith — source: statement_of_faith_final.pdf (4 pages).
// Text kept as written; only typo-level fixes (see git history).

export interface Scripture {
  text: string;
  ref: string;
}

export interface Doctrine {
  title: string;
  body: string;
  scriptures: Scripture[];
}

export interface ListItem {
  name: string;
  body: string;
}

export const foundationalDoctrines: Doctrine[] = [
  {
    title: "God the Father",
    body: "There is one true God, the Father, who created all things, sustains all life, and loves the world intimately.",
    scriptures: [
      { text: "Yet for us there is but one God, the Father, from whom all things came and for whom we live...", ref: "1 Corinthians 8:6" },
      { text: "For God so loved the world that he gave his one and only Son...", ref: "John 3:16" },
    ],
  },
  {
    title: "Jesus Christ, the Son of God",
    body: "Jesus is fully God manifest in the flesh. He lived a sinless life, died on the cross for our sins, rose physically from the dead on the third day, and is the only way to the Father.",
    scriptures: [
      { text: "In the beginning was the Word... and the Word was God... The Word became flesh and made his dwelling among us.", ref: "John 1:1, 14" },
      { text: "I am the way and the truth and the life. No one comes to the Father except through me.", ref: "John 14:6" },
    ],
  },
  {
    title: "The Holy Spirit, the Indwelling Helper",
    body: "The Holy Spirit is fully God, living inside believers to guide, comfort, convict of sin, and empower them to live in holiness and boldness.",
    scriptures: [
      { text: "And I will ask the Father, and he will give you another advocate to help you and be with you forever—the Spirit of truth.", ref: "John 14:16–17" },
      { text: "Do you not know that your bodies are temples of the Holy Spirit, who is in you...", ref: "1 Corinthians 6:19" },
    ],
  },
];

export const salvationIntro =
  "Salvation is a free gift of God's grace that cannot be earned by human merit, yet Jesus laid out clear, non-negotiable standards required to enter the Kingdom of God.";

export const salvationRequirements: Doctrine[] = [
  {
    title: "Belief",
    body: "Placing complete trust in Jesus Christ as the Son of God and the sole Savior from sin and eternal death.",
    scriptures: [
      { text: "Whoever believes in him shall not perish but have eternal life.", ref: "John 3:16" },
      { text: "If you declare with your mouth, 'Jesus is Lord,' and believe in your heart that God raised him from the dead, you will be saved.", ref: "Romans 10:9" },
    ],
  },
  {
    title: "Repentance",
    body: "A decisive, permanent turning away from self-governed sin and rebellion toward God's authority and righteousness.",
    scriptures: [
      { text: "From that time on Jesus began to preach, 'Repent, for the kingdom of heaven has come near.'", ref: "Matthew 4:17" },
      { text: "Unless you repent, you too will all perish.", ref: "Luke 13:3" },
    ],
  },
  {
    title: "Obedience",
    body: "Genuine faith is proven by action. Calling Jesus \"Lord\" without obeying His words leaves a person with no foundation, resulting in complete ruin when judgment comes.",
    scriptures: [
      { text: "Not everyone who says to me, 'Lord, Lord,' will enter the kingdom of heaven, but only the one who does the will of my Father who is in heaven.", ref: "Matthew 7:21" },
      { text: "Therefore everyone who hears these words of mine and puts them into practice is like a wise man who built his house on the rock... But everyone who hears these words of mine and does not put them into practice is like a foolish man who built his house on sand. The rain came down... and it fell with a great crash.", ref: "Matthew 7:24–27" },
    ],
  },
  {
    title: "Total Commitment",
    body: "Jesus demands absolute Lordship. Anyone who clings to alternate priorities, earthly possessions, or their own self-will above Him cannot be His disciple.",
    scriptures: [
      { text: "Whoever wants to be my disciple must deny themselves and take up their cross daily and follow me.", ref: "Luke 9:23" },
      { text: "In the same way, those of you who do not give up everything you have cannot be my disciples.", ref: "Luke 14:33" },
      { text: "No one who puts a hand to the plow and looks back is fit for service in the kingdom of God.", ref: "Luke 9:62" },
    ],
  },
];

export const baptisms: Doctrine[] = [
  {
    title: "Water Baptism: Burial of the Old Life",
    body: "Water baptism by immersion is a direct command from Jesus. It publicly declares that a believer's old sinful nature is buried with Christ and raised to walk in a brand-new life.",
    scriptures: [
      { text: "Repent and be baptized, every one of you, in the name of Jesus Christ for the forgiveness of your sins.", ref: "Acts 2:38" },
      { text: "We were therefore buried with him through baptism into death in order that... we too may live a new life.", ref: "Romans 6:4" },
    ],
  },
  {
    title: "Baptism of the Holy Spirit",
    body: "An immersion in God's supernatural power to empower believers to be bold witnesses. Speaking in tongues is a spiritual prayer language given by the Spirit as an initial physical sign of this baptism and for personal edification.",
    scriptures: [
      { text: "But you will receive power when the Holy Spirit comes on you; and you will be my witnesses...", ref: "Acts 1:8" },
      { text: "All of them were filled with the Holy Spirit and began to speak in other tongues as the Spirit enabled them.", ref: "Acts 2:4" },
      { text: "Anyone who speaks in a tongue edifies themselves...", ref: "1 Corinthians 14:4" },
    ],
  },
];

export const spiritGiftsIntro =
  "Supernatural tools given spontaneously by the Holy Spirit to build up, protect, and guide the Church:";

export const spiritGifts: { category: string; subtitle: string; gifts: ListItem[] }[] = [
  {
    category: "Revelation Gifts",
    subtitle: "Power to Know",
    gifts: [
      { name: "Word of Wisdom", body: "Supernatural divine direction or solution for a specific situation." },
      { name: "Word of Knowledge", body: "Supernaturally knowing facts about a person or event without natural means." },
      { name: "Discerning of Spirits", body: "Perceiving whether the Holy Spirit, a demonic spirit, or human flesh is operating." },
    ],
  },
  {
    category: "Power Gifts",
    subtitle: "Power to Do",
    gifts: [
      { name: "Gift of Faith", body: "Sudden, supernatural certainty that God will do the impossible." },
      { name: "Gifts of Healings", body: "Supernatural restoration of physical, mental, or emotional health." },
      { name: "Working of Miracles", body: "Immediate divine intervention altering natural laws." },
    ],
  },
  {
    category: "Vocal Gifts",
    subtitle: "Power to Speak",
    gifts: [
      {
        name: "Prophecy (Prophēteia)",
        body: "Spontaneous, Spirit-inspired revelation—frequently foretelling future events (such as Agabus predicting famine and arrest in Acts 11:28; 21:11) or exposing hidden realities—which results in the church being strengthened, warned, and comforted (1 Corinthians 14:3, 24–25).",
      },
      { name: "Different Kinds of Tongues", body: "A public message spoken in an unlearned spiritual language." },
      { name: "Interpretation of Tongues", body: "Supernatural translation of a public tongue so the church understands." },
    ],
  },
];

export const bodyGifts: ListItem[] = [
  { name: "Preaching / Proclaiming (Kerusso)", body: "Heralding the Good News boldly to the lost to bring them to salvation (2 Timothy 4:2)." },
  { name: "Teaching", body: "Supernaturally explaining Scripture clearly to ground saved believers in daily obedience (Romans 12:7)." },
  { name: "Serving, Encouraging, Giving, Leadership, and Mercy", body: "Practical grace gifts given to build up the local body (Romans 12:7–8)." },
];

export const fiveFoldIntro =
  "Christ gave equipping roles not to rule over believers, but to train everyday Christians for service (Ephesians 4:11–12):";

export const fiveFold: ListItem[] = [
  { name: "Apostles", body: "Ground-breakers sent to establish new communities of believers and guard foundational truth." },
  { name: "Prophets", body: "Spirit-led messengers who speak God's direct revelation, foretell coming events to prepare the church, and call believers to repentance and alignment (Acts 11:27–28; 21:9–11)." },
  { name: "Evangelists", body: "Preachers gifted to proclaim the Gospel to non-believers and gather people to Christ." },
  { name: "Pastors", body: "Shepherds who nurture, protect, and care for the spiritual health of the local flock." },
  { name: "Teachers", body: "Instructors who unpack Scripture so believers can apply God's commands daily." },
  { name: "Elders/Overseers & Deacons", body: "Spiritually mature local leaders who oversee the flock (Titus 1:5–7) alongside servant-leaders who manage practical, physical, and financial needs (Acts 6:1–6)." },
];

export const greatCommission: ListItem = {
  name: "Go and Make Disciples, Baptizing Them",
  body: "Actively share the Good News with people everywhere (Matthew 28:19; Mark 16:15).",
};

export const dailyCommands: ListItem[] = [
  { name: "Love God and Neighbor", body: "The greatest commands, which sum up the Law. The Golden Rule: treat others as you want to be treated (Mark 12:30–31)." },
  { name: "Love Enemies & Forgive", body: "Pray for those who mistreat you and release all grudges (Matthew 5:44; Colossians 3:13)." },
  { name: "Pray Without Ceasing & Give Thanks", body: "Keep constant conversation and gratitude toward God (1 Thessalonians 5:17–18)." },
  { name: "Flee From Sin", body: "Turn away from immorality and operate every spiritual gift in genuine love (1 Corinthians 6:18; 13:1–3)." },
  { name: "Care for the Needy", body: "True religion is this: help those in need and regularly encourage fellow believers (James 2:15–16; Hebrews 10:24–25)." },
];

export const closingPrinciple = {
  title: "Childlike Simplicity Over Man-Made Complexity",
  body: "Jesus declared, \"Truly I tell you, unless you change and become like little children, you will never enter the kingdom of heaven\" (Matthew 18:3). The Gospel is a simple message that requires taking God at His word and obeying His instructions. Just as the early church was led by ordinary, unschooled men who had simply been with Jesus, the message of the New Testament does not require academic degrees or denominational scholars to decode (Acts 4:13).",
};
