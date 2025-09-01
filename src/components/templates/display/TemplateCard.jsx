export default function TemplateCard({ template, deleteTemplate }) {
  return (
    <div class="flex flex-col justify-center w-64 rounded-[20px] p-[20px] bg-white text-black cursor-pointer">
      <p>Name: {template.name}</p>
      {template.parameters.map((parameter) => {
        const value = parameter.values;
        return (
          <div>
            <p>Parameter: {parameter.name}</p>
            {value.map((val) => {
              return <p>- {val}</p>;
            })}
          </div>
        );
      })}
      <button onClick={() => deleteTemplate(template.id)}>Delete</button>
    </div>
  );
}
