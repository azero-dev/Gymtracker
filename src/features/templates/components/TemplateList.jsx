import { Fragment } from "preact";
import TemplateCard from "./TemplateCard.jsx";

export default function TemplateList({ useTemplate, onEdit }) {
    const { templates, updating, deleting, deleteTemplate, loading, error } =
        useTemplate;
    // TODO: implement updating

    if (loading) {
        return (
            <div>
                <p>Loading templates...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <p>Error loading templates: {error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <Fragment>
            {!loading &&
                Array.isArray(templates) &&
                templates.map((template) => {
                    return (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            deleteTemplate={deleteTemplate}
                            onEdit={onEdit}
                        />
                    );
                })}
        </Fragment>
    );
}
