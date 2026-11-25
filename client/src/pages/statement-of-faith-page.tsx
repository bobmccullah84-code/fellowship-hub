import NavigationHeader from "@/components/navigation-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Cross, Droplets, Flame, Gift, Megaphone, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  foundationalDoctrines,
  salvationIntro,
  salvationRequirements,
  baptisms,
  spiritGiftsIntro,
  spiritGifts,
  bodyGifts,
  fiveFoldIntro,
  fiveFold,
  greatCommission,
  dailyCommands,
  closingPrinciple,
  type Doctrine,
  type ListItem,
} from "@/content/statement-of-faith";

const sections = [
  { id: "godhead", label: "The Godhead" },
  { id: "salvation", label: "Salvation" },
  { id: "baptism", label: "Baptism" },
  { id: "gifts", label: "Gifts & Ministries" },
  { id: "commands", label: "New Testament Commands" },
  { id: "closing", label: "Closing Principle" },
];

function SectionHeading({ id, number, title, icon: Icon }: { id: string; number: number; title: string; icon: LucideIcon }) {
  return (
    <div id={id} className="scroll-mt-24 flex items-center gap-3 mb-6">
      <div className="bg-primary/10 w-11 h-11 rounded-lg flex items-center justify-center shrink-0">
        <Icon className="text-primary h-5 w-5" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
        <span className="text-primary mr-2">{number}.</span>
        {title}
      </h2>
    </div>
  );
}

function DoctrineCard({ doctrine }: { doctrine: Doctrine }) {
  return (
    <Card className="shadow-sm" data-testid={`doctrine-${doctrine.title}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{doctrine.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground leading-relaxed">{doctrine.body}</p>
        <div className="space-y-3">
          {doctrine.scriptures.map((s) => (
            <blockquote key={s.ref} className="border-l-4 border-primary/40 pl-4 text-muted-foreground">
              <p className="italic leading-relaxed">“{s.text}”</p>
              <cite className="not-italic text-sm font-semibold text-primary">— {s.ref}</cite>
            </blockquote>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ItemList({ items }: { items: ListItem[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.name} className="flex items-start">
          <Cross className="text-accent mr-3 h-4 w-4 shrink-0 mt-1" />
          <span className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">{item.name}:</strong> {item.body}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function StatementOfFaithPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="text-primary h-12 w-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Statement of Faith</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            What we believe, grounded in the Word of God.
          </p>
        </div>

        {/* Section links */}
        <nav aria-label="Sections" className="flex flex-wrap justify-center gap-2 mb-12">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-3 py-1.5 rounded-full text-sm bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="space-y-16">
          {/* 1. Godhead */}
          <section>
            <SectionHeading id="godhead" number={1} title="Foundational Doctrines of the Godhead" icon={Sparkles} />
            <div className="space-y-6">
              {foundationalDoctrines.map((d) => (
                <DoctrineCard key={d.title} doctrine={d} />
              ))}
            </div>
          </section>

          {/* 2. Salvation */}
          <section>
            <SectionHeading id="salvation" number={2} title="Requirements for Salvation" icon={Cross} />
            <p className="text-lg text-foreground leading-relaxed mb-6">{salvationIntro}</p>
            <div className="space-y-6">
              {salvationRequirements.map((d) => (
                <DoctrineCard key={d.title} doctrine={d} />
              ))}
            </div>
          </section>

          {/* 3. Baptism */}
          <section>
            <SectionHeading id="baptism" number={3} title="Baptism in Water & Baptism of the Holy Spirit" icon={Droplets} />
            <div className="space-y-6">
              {baptisms.map((d) => (
                <DoctrineCard key={d.title} doctrine={d} />
              ))}
            </div>
          </section>

          {/* 4. Gifts & Ministries */}
          <section>
            <SectionHeading id="gifts" number={4} title="Spiritual Gifts & Church Ministries" icon={Gift} />

            <h3 className="text-xl font-semibold text-foreground mb-2">The Nine Gifts of the Spirit</h3>
            <p className="text-sm text-primary font-medium mb-2">1 Corinthians 12:8–10</p>
            <p className="text-muted-foreground mb-5">{spiritGiftsIntro}</p>
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              {spiritGifts.map((group) => (
                <Card key={group.category} className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{group.category}</CardTitle>
                    <p className="text-sm text-muted-foreground">{group.subtitle}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {group.gifts.map((g) => (
                      <div key={g.name}>
                        <p className="font-semibold text-foreground text-sm">{g.name}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{g.body}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-2">Functional Body Gifts & Preaching vs. Teaching</h3>
            <p className="text-sm text-primary font-medium mb-4">Romans 12:6–8; 1 Corinthians 12:28</p>
            <div className="mb-10">
              <ItemList items={bodyGifts} />
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-2">The Five-Fold Equipping Ministries & Local Church Roles</h3>
            <p className="text-muted-foreground mb-4">{fiveFoldIntro}</p>
            <ItemList items={fiveFold} />
          </section>

          {/* 5. Commands */}
          <section>
            <SectionHeading id="commands" number={5} title="The New Testament Commands" icon={Megaphone} />
            <Card className="shadow-sm mb-6 bg-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">The Great Commission</CardTitle>
              </CardHeader>
              <CardContent>
                <ItemList items={[greatCommission]} />
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Daily Character, Worship & Community</CardTitle>
              </CardHeader>
              <CardContent>
                <ItemList items={dailyCommands} />
              </CardContent>
            </Card>
          </section>

          {/* Closing */}
          <section>
            <div id="closing" className="scroll-mt-24">
              <Card className="shadow-md border-primary/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Flame className="text-primary h-6 w-6" />
                    <CardTitle className="text-2xl">Closing Principle: {closingPrinciple.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed text-lg">{closingPrinciple.body}</p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-16">
          Scripture quotations taken from The Holy Bible, New International Version® NIV®. Copyright © 1973, 1978, 1984, 2011 by Biblica, Inc.™ Used by permission. All rights reserved worldwide.
        </p>
      </div>
    </div>
  );
}
