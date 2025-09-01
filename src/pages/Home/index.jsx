import { useState, useEffect } from "preact/hooks";
import Stats from "../../components/Stats.jsx";
import DataList from "../../components/DataList.jsx";
import Menu from "../../components/Menu.jsx";
import TemplateList from "../../components/templates/display/TemplateList.jsx";
import TemplateDashboard from "../../components/templates/display/TemplateDashboard.jsx";
import SessionDashboard from "../../components/sessions/SessionDashboard.jsx";
import TemplateForm from "../../components/templates/display/TemplateDashboard.jsx";
import "./style.css";

export function Home() {
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div class="w-full font-sans bg-gray-950 text-white min-h-screen grid grid-cols-1 grid-rows-[40vh_minmax(80px,100px)_auto]">
      <Stats />
      <Menu setIsMenuOpen={setIsMenuOpen} />
      <div class="bg-gray-900 m-[0_20px] p-[20px] rounded-[20px_20px_0_0]">
        {/* TODO: swap components when TemplateCreation done */}
        {isMenuOpen ? <SessionDashboard /> : <TemplateDashboard />}
      </div>
    </div>
  );
}

function Resource(props) {
  return (
    <a href={props.href} target="_blank" class="resource">
      <h2>{props.title}</h2>
      <p>{props.description}</p>
    </a>
  );
}
