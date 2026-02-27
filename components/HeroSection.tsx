export default function HeroSection() {
  return (
    <div className="relative overflow-hidden cursor-pointer group border-b border-ink-mid">

      {/* Background image */}
      <div
        className="
          h-[280px] bg-cover bg-center bg-no-repeat
          transition-transform duration-700 ease-out group-hover:scale-[1.02]
        "
        style={{
          backgroundImage: `url('https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/blt1a0c5de83a0c2c88/63eb1e9e6e7fce4b4ef66ac0/worlds-2022-banner.jpg')`,
          backgroundColor: "#0D1525",
        }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-void/95 via-void/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />

      {/* Hex pattern texture */}
      <div className="absolute inset-0 bg-hex-pattern opacity-40" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-7">

        {/* Top tag row */}
        <div className="flex items-center gap-2 mb-3">
          <span className="
            font-cond text-[10px] font-bold tracking-[0.18em] uppercase
            bg-lck/15 text-lck border border-lck/30 px-2 py-0.5 rounded-sm
          ">
            LCK
          </span>
          <span className="
            font-cond text-[10px] font-bold tracking-[0.18em] uppercase
            bg-gold/10 text-gold border border-gold/25 px-2 py-0.5 rounded-sm
          ">
            Breaking
          </span>
        </div>

        {/* Headline */}
        <h1 className="
          font-display text-3xl font-bold leading-tight text-text-primary
          max-w-[580px] text-balance
          drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]
          group-hover:text-gold transition-colors duration-300
        ">
          Faker reaches 10,000 competitive kills — a milestone no other LCK player has ever touched
        </h1>

        {/* Subline */}
        <p className="mt-2.5 font-body text-sm text-text-secondary max-w-[480px] leading-relaxed">
          SKT T1's legendary mid laner sealed the record in Game 3 against GenG, scoring a pentakill on Azir
        </p>

        {/* Footer */}
        <div className="mt-4 flex items-center gap-4 font-cond text-xs text-text-muted tracking-wide">
          <span>Feb 26, 2026</span>
          <span className="w-1 h-1 rounded-full bg-text-muted" />
          <span className="text-gold/60">LCK Spring 2026</span>
          <span className="w-1 h-1 rounded-full bg-text-muted" />
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            480 comments
          </span>
        </div>

      </div>
    </div>
  );
}
