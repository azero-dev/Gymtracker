export default function Menu({ setIsMenuOpen }) {
  const handleClick = () => {
    setIsMenuOpen((prevState) => !prevState);
  };

  return (
    <div class="p-5 font-bold flex items-center justify-center">
      <a
        onClick={handleClick}
        class="bg-white text-black p-2.5 rounded-[20px]"
        href="#"
      >
        Add new session
      </a>
    </div>
  );
}
