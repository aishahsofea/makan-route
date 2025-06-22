"use client";

import { Button as HeroButton } from "@heroui/react";

type ButtonProps = {
  type?: "button" | "submit" | "reset";
  text: string;
  isDisabled?: boolean;
};

export const Button = ({ type, text, isDisabled }: ButtonProps) => {
  return (
    <HeroButton
      style={{ backgroundColor: "var(--secondary)" }}
      type={type ?? "button"}
      isDisabled={isDisabled ?? false}
      className="w-full transition-all duration-300 hover:translate-y-[-2px] rounded-none text-md"
    >
      {text}
    </HeroButton>
  );
};
