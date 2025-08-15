import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import DeleteSession from "./DeleteSession.jsx";
import ModifySession from "./ModifySession.jsx";
import ShowFullSession from "./ShowFullSession.jsx";

export default function Session(el) {
  const [items, setItems] = useState([]);

  const session = el.sessionData;
  useEffect(() => {
    // console.log(session);
  }, []);

  return (
    <div class="flex-none w-64 rounded-[20px] p-[20px] bg-white text-black">
      <div>
        <p class="w-[50%] inline-block text-right">Weight:</p>{" "}
        <p class="inline text-left font-bold">{session.weight}</p>
      </div>
      <div>
        <p class="w-[50%] inline-block text-right">Distance:</p>{" "}
        <p class="inline text-left font-bold">{session.distance}</p>
      </div>
      <div>
        <p class="w-[50%] inline-block text-right">Time:</p>{" "}
        <p class="inline text-left font-bold">{session.time}</p>
      </div>
      <div>
        <p class="w-[50%] inline-block text-right">Food:</p>{" "}
        <p class="inline text-left font-bold">{session.food}</p>
      </div>
      <div>
        <p class="w-[50%] inline-block text-right">Created:</p>{" "}
        <p class="inline text-left font-bold">{session.created_at}</p>
      </div>
      <DeleteSession deleteID={session.id} />
      <ModifySession modifySession={session} />
      <ShowFullSession showID={session} />
    </div>
  );
}
