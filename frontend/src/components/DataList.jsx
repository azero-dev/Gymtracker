import { Fragment, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import Session from "./Session.jsx";

export default function DataList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("/api/numbers")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.numbers);
      })
      .catch((err) => {
        console.log("Error: ", err);
      });
  }, []);

  return (
    <ul class="flex flex-wrap gap-6 mx-auto max-w-8xl justify-center">
      {items.map((el) => (
        <Session sessionData={el} />
      ))}
    </ul>
  );
}
