import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header className="text-white fixed">
      <div className="top-4 left-8 fixed">
        <Link href="/" className="text-xl font-bold">
          Scan Typing
        </Link>
      </div>
      <div className="top-4 right-8 fixed">
        <Image src="/eggplant_white.png" width={30} height={30} alt="" />
      </div>
    </header>
  );
};

export default Header;
