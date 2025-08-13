import { Fragment } from "preact";
import { useState } from "preact/hooks";

export default function Menu({ setIsMenuOpen }) {
  const handleClick = () => {
    if (typeof setIsMenuOpen === "function") {
      setIsMenuOpen((prevState) => !prevState);
    } else {
      console.error("setIsMenuOpen is not a function!");
    }
  };

  return (
    <Fragment>
      <div class="p-5 font-bold flex items-center justify-center">
        <a
          onClick={handleClick}
          class="bg-white text-black p-2.5 rounded-[20px]"
          href="#"
        >
          Add new session
        </a>
      </div>
    </Fragment>
  );
}
