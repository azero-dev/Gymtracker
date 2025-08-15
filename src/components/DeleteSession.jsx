import { Fragment, h } from "preact";
import { useState } from "preact/hooks";

export default function Session({ deleteID }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Do you want to delete this session?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/numbers/${deleteID}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        alert("Successfully deleted!");
      } else {
        alert(`Error: ${result.error || "Failed to delete"}`);
      }
    } catch (error) {
      console.error("Error: ", error);
      alert("Network error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      class="bg-gray-800 w-[90%] m-[5px] p-[5px] text-white rounded-[20px] font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
