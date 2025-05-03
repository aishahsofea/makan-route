"use client";

import { Button as HeroButton } from "@heroui/button";

type ButtonProps = {
  type?: "button" | "submit" | "reset";
  text: string;
  isDisabled?: boolean;
};

export const Button = ({ type, text, isDisabled }: ButtonProps) => {
  const handleClick = () => {
    console.log("Button clicked");
  };

  return (
    <HeroButton
      type={type ?? "button"}
      onPress={handleClick}
      isDisabled={isDisabled ?? false}
      className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-md hover:cursor-pointer h-12 text-base"
    >
      {text}
    </HeroButton>
  );
};
