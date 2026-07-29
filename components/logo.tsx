import Image from "next/image";

export function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="eGovBridgeAI"
      width={150}
      height={100}
      priority
      className="h-auto w-auto"
    />
  );
}
