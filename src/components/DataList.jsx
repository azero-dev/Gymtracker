import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import Session from "./Session.jsx";

export default function DataList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/numbers");

        if (!res.ok) {
          throw new Error(
            `Error while fetching: ${res.status} ${res.statusText}`,
          );
        }

        const data = await res.json();
        setItems(data.numbers || []);
      } catch (err) {
        setError(err.message);
        console.log("Error getting data: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // TODO: create a loading and error components
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error getting the info. Better call Evan You</div>;
  }

  return (
    // TODO: put flex box in parent component
    <ul class="flex flex-wrap gap-6 mx-auto max-w-8xl justify-center">
      {items.map((el) => (
        <Session key={el.id} sessionData={el} />
      ))}
    </ul>
  );
}
