import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import HeroSection from "@/components/HeroSection";
import NewsFeed from "@/components/NewsFeed";
import RightSidebar from "@/components/RightSidebar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-void">
      <Navbar />

      {/* ── Three-column layout ── */}
      <div
        className="
          max-w-[1320px] mx-auto
          grid grid-cols-[186px_1fr_286px]
          min-h-[calc(100vh-50px)]
        "
      >
        {/* Left sidebar */}
        <LeftSidebar />

        {/* Center: hero + news */}
        <main className="border-r border-ink-mid overflow-y-auto">
          <HeroSection />
          <NewsFeed />
        </main>

        {/* Right sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
}
