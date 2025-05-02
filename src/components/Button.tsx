"use client";

import { useRouter } from "next/navigation";
import { Button as HeroButton } from "@heroui/button";

type ButtonProps = {
  text: string;
  navigateTo?: string;
};

export const Button = ({ text, navigateTo }: ButtonProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (navigateTo) {
      router.push(navigateTo);
    } else {
      console.warn("No navigation path provided");
    }
  };

  return (
    <HeroButton
      onPress={handleClick}
      className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-md hover:cursor-pointer h-12 text-base"
    >
      {text}
    </HeroButton>
  );
};
