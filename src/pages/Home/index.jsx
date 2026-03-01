import { useState } from "preact/hooks";
import Stats from "../../shared/ui/Stats.jsx";
import Menu from "../../shared/ui/Menu.jsx";
import TemplateDashboard from "../../features/templates/components/TemplateDashboard.jsx";
import SessionDashboard from "../../features/sessions/components/SessionDashboard.jsx";
import "./style.css";

export function Home() {
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  return (
    <div class="w-full font-sans bg-[#000000] text-[#f9f9f9] min-h-screen flex flex-col">
      <Stats />
      <Menu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <div class="flex-1 bg-[#17181c] mx-0 md:mx-5 p-3 md:p-5 rounded-t-2xl md:rounded-t-3xl overflow-hidden">
        <div key={isMenuOpen ? "sessions" : "templates"} class="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isMenuOpen ? <SessionDashboard /> : <TemplateDashboard />}
        </div>
      </div>
    </div>
  );
}
