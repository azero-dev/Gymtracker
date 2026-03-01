import { useState } from "preact/hooks";
import { useTemplates } from "../hooks/useTemplates.js";
import TemplateList from "./TemplateList.jsx";
import CreateTemplate from "./CreateTemplate.jsx";
import AddButton from "../../../shared/ui/AddButton.jsx";
import LoadingScreen from "../../../shared/ui/LoadingScreen.jsx";
import Modal from "../../../shared/ui/Modal.jsx";

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
        updateTemplate,
        deleteTemplate,
    } = useTemplates();
    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const handleCreateClick = () => {
        setIsCreatingTemplate(true);
        setEditingTemplate(null);
    };

    const handleEditClick = (template) => {
        setEditingTemplate(template);
        setIsCreatingTemplate(true);
    };

    const handleClose = () => {
        setIsCreatingTemplate(false);
        setEditingTemplate(null);
    };

    const handleDeleteRequest = (templateId) => {
        const tpl = templates.find(t => t.id === templateId);
        setDeleteConfirm({ id: templateId, name: tpl?.name || "this routine" });
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirm) {
            deleteTemplate(deleteConfirm.id);
            setDeleteConfirm(null);
        }
    };

    return (
        <div className="flex flex-col gap-4 min-h-[300px] mt-2">

            <Modal
                isOpen={!!deleteConfirm}
                title="Delete Routine"
                message={`Are you sure you want to delete "${deleteConfirm?.name}"? All sessions linked to this routine will also be affected. This action cannot be undone.`}
                onClose={() => setDeleteConfirm(null)}
                buttons={[
                    { label: "Cancel", onClick: () => setDeleteConfirm(null) },
                    { label: "Delete", variant: "danger", onClick: handleDeleteConfirm },
                ]}
            />

            {error && (
                <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 p-3 rounded-xl text-[#ef4444] text-center text-sm max-w-md mx-auto">
                    Error getting the info. Please try again.
                </div>
            )}

            {loading ? (
                <LoadingScreen />
            ) : isCreatingTemplate ? (
                <div className="w-full animate-in fade-in slide-in-from-top-4 duration-300">
                    <CreateTemplate
                        onClose={handleClose}
                        useTemplate={{ createTemplate, updateTemplate }}
                        editingTemplate={editingTemplate}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 w-full items-stretch animate-in fade-in zoom-in duration-300">
                    <AddButton onClick={handleCreateClick} />
                    <TemplateList
                        useTemplate={{
                            templates,
                            updating,
                            deleting,
                            deleteTemplate: handleDeleteRequest,
                            loading,
                            error,
                        }}
                        onEdit={handleEditClick}
                    />
                </div>
            )}
        </div>
    );
}
