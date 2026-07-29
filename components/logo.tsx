import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="eGovBridgeAI"
      width={811}
      height={124}
      priority
      className={`w-auto ${className ?? "h-8"}`}
    />
  );
}
