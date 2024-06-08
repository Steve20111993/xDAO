import Image from "next/image";
import Link from "next/link";
import logo from "/public/favicon.svg";
import styles from "./Header.module.scss";
import { Nav } from "../Nav";

export const Header = () => {
  return (
    <header className={`w-full p-4 gap-4 flex justify-between z-1 ${styles.header}`}>
      <a href="/" >
        <div className={`px-2 inline-flex ${styles.logo}`}>
          <Image height={60} width={60} src={logo} alt="xDAO" />
        </div>
      </a>
      <Nav />
    </header>
  );
};