import { useEffect, useState } from "preact/hooks";
// import Session from "./session/Session.jsx";

export default function DataList({ setIsMenuOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Here there are 2 different fetches. totalData is used to
    // store all the data fetched from both endpoints.
    // When old fetch is deleted, this must be re arranged
    // so that there is only one fetch.
    //
    // Show here ONLY sessions, the current templates must be moved.
    let totalData = [];

    //This is the new fetch (sessions).
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/sessions");
        if (!res.ok) {
          throw new Error(
            `Error while fetching: ${res.status} ${res.statusText}`,
          );
        }
        const data = await res.json();
        totalData.push(...data.sessions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();

    // This is the old fetch (numbers).
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
        totalData.push(...data.numbers);
        setItems(totalData || []);
      } catch (err) {
        setError(err.message);
        console.log("Error getting data: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error getting the info.</div>;
  }

  const handleClick = () => {
    setIsMenuOpen((e) => !e);
  };
  return (
    // TODO: put flex box in parent component
    // TODO: Create component for the "add new session" button
    <ul class="flex flex-wrap gap-6 mx-auto max-w-8xl justify-center">
      <div
        onClick={handleClick}
        class="flex justify-center w-64 rounded-[20px] p-[20px] bg-white text-black cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 640"
          width="50%"
        >
          <path d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM296 408L296 344L232 344C218.7 344 208 333.3 208 320C208 306.7 218.7 296 232 296L296 296L296 232C296 218.7 306.7 208 320 208C333.3 208 344 218.7 344 232L344 296L408 296C421.3 296 432 306.7 432 320C432 333.3 421.3 344 408 344L344 344L344 408C344 421.3 333.3 432 320 432C306.7 432 296 421.3 296 408z" />
        </svg>
      </div>
      {/* This has been disabled until Session component restored */}
      {/* {items.map((el) => ( */}
      {/*   <Session key={el.id} sessionData={el} /> */}
      {/* ))} */}
    </ul>
  );
}
