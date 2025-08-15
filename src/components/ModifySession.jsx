import { h } from "preact";
import { useEffect, useState } from "preact/hooks";

export default function ModifySession(el) {
  const session = el.modifySession;
  useEffect(() => {
    // console.log(session);
  }, []);

  // TODO: delete session by id

  return (
    <button
      class="bg-gray-800 w-[90%] m-[5px] p-[5px] text-white rounded-[20px] font-bold cursor-pointer"
      onClick={() => {
        alert("Hola");
      }}
    >
      Modify
    </button>
  );
}
