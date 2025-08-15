import { Fragment, h } from "preact";
import { useEffect, useState } from "preact/hooks";

export default function ShowFullSession(el) {
  const id = el.showID;
  useEffect(() => {
    // console.log(id);
  }, []);

  // TODO: show session by id

  return (
    <button
      class="bg-gray-800 w-[90%] m-[5px] p-[5px] text-white rounded-[20px] font-bold cursor-pointer"
      onClick={() => {
        // alert("Hola");
      }}
    >
      Show more
    </button>
  );
}
