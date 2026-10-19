import Link from "next/link";
import { Icon } from "./icon";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Perishables Black Box home">
      <span className="brand-symbol">
        <Icon name="leaf" size={25} />
      </span>
      <span>
        perishables<span className="brand-sub">BLACK BOX</span>
      </span>
    </Link>
  );
}
