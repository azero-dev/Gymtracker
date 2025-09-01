import { useEffect, useState } from "preact/hooks";
import AddButton from "../AddButton.jsx";
// Components to replace
// import Session from "../session/Session.jsx";

export default function SessionDashboard() {
  const [items, setItems] = useState();
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
        console.log("Fetched data: ", data);
        setItems(data.numbers);
      } catch (err) {
        setError(err.message);
        console.log("Error getting data: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleClick = () => {};
  // TODO: create loading and error components
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error getting the info.</div>;
  }

  return (
    <div>
      <h1 className="text-4xl text-center font-extrabold">Sessions</h1>
      <div className="flex flex-wrap gap-6 mx-auto max-w-8xl justify-center">
        <AddButton onClick={handleClick} />
        {/* This has been disabled until sessions are implemented. */}
        {/* {items && items.map((el) => <Session key={el.id} sessionData={el} />)} */}
      </div>
    </div>
  );
}
