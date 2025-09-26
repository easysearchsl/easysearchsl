export default function About() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">About EasySearch</h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-3xl">
            Connecting people and businesses in Sierra Leone and beyond.
          </p>
        </div>
      </section>

      {/* About EasySearch */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-semibold mb-3">What is EasySearch?</h2>
          <p className="text-foreground/80 leading-relaxed">
            EasySearch is a business directory and discovery platform designed to connect users with
            businesses, products, and services. Whether you’re a small shop owner or a large enterprise,
            EasySearch provides the tools to help your business grow and reach the right audience.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
            <p className="text-foreground/80">
              To empower businesses by providing visibility, accessibility, and growth opportunities through technology.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
            <p className="text-foreground/80">
              To be the most trusted and comprehensive digital business directory in Sierra Leone and across Africa.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl font-semibold mb-6">Core Values</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-sm font-medium">Transparency</div>
            <p className="mt-2 text-sm text-foreground/80">We communicate clearly and operate with integrity.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-sm font-medium">Innovation</div>
            <p className="mt-2 text-sm text-foreground/80">We continuously improve to serve users and businesses better.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-sm font-medium">Community Growth</div>
            <p className="mt-2 text-sm text-foreground/80">We uplift local businesses and the wider ecosystem.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-sm font-medium">Customer Success</div>
            <p className="mt-2 text-sm text-foreground/80">We focus on outcomes that help our customers thrive.</p>
          </div>
        </div>
      </section>

      {/* Our Journey / Timeline */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl font-semibold mb-6">Our Journey</h2>
        <div className="relative pl-6 border-l border-border">
          <div className="absolute -left-[6px] top-0 h-3 w-3 rounded-full bg-primary" />
          <div className="mb-6">
            <div className="text-sm text-foreground/60">Founded</div>
            <p className="text-foreground/90">Founded in [Year], EasySearch started as a simple idea to make businesses more discoverable online.</p>
          </div>
          <div className="absolute -left-[6px] top-[82px] h-3 w-3 rounded-full bg-primary/70" />
          <div>
            <div className="text-sm text-foreground/60">Today</div>
            <p className="text-foreground/90">Today, we support organizations of all sizes, helping them connect with customers and grow.</p>
          </div>
        </div>
      </section>

      {/* Meet the Team (Optional) */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl font-semibold mb-6">Meet the Team</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1,2,3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5 flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-muted" />
              <div>
                <div className="font-medium">Team Member {i}</div>
                <div className="text-sm text-foreground/70">Role</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-14 md:py-16">
        <div className="rounded-lg border border-border bg-card p-8 md:p-10 text-center">
          <h3 className="text-2xl font-semibold">Join EasySearch Today</h3>
          <p className="mt-2 text-foreground/80 max-w-2xl mx-auto">Register your business and connect with customers looking for your products and services.</p>
          <div className="mt-5">
            <a href="/register" className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-primary-foreground hover:opacity-90 transition">Register Your Business</a>
          </div>
        </div>
      </section>
    </div>
  );
}
