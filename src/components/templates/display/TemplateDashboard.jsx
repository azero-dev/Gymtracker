import { useState } from "preact/hooks";
import { useTemplates } from "../hooks/useTemplates.js";
import TemplateList from "./TemplateList";
import CreateTemplate from "../editors/CreateTemplate.jsx";
import AddButton from "../../AddButton.jsx";

export default function TemplateDashboard() {
  const {
    templates,
    loading,
    error,
    saving,
    deleting,
    updating,
    loadTemplates,
    createTemplate,
    deleteTemplate,
  } = useTemplates();
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);

  const handleClick = () => {
    setIsCreatingTemplate((prev) => !prev);
  };

  return (
    <div>
      <h1 className="text-4xl text-center font-extrabold">Templates</h1>
      <div className="flex flex-wrap gap-6 mx-auto max-w-8xl justify-center">
        {!isCreatingTemplate && <AddButton onClick={handleClick} />}
        {!isCreatingTemplate && (
          <TemplateList
            useTemplate={{
              templates,
              updating,
              deleting,
              deleteTemplate,
              loading,
              error,
            }}
          />
        )}
        {isCreatingTemplate && (
          <CreateTemplate
            onClose={handleClick}
            useTemplate={{ createTemplate }}
          />
        )}
      </div>
    </div>
  );
}
