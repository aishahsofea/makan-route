import { Button as HeroButton } from "@heroui/button";

type ButtonProps = {
  type?: "button" | "submit" | "reset";
  text: string;
  isDisabled?: boolean;
};

export const Button = ({ type, text, isDisabled }: ButtonProps) => {
  return (
    <HeroButton
      type={type ?? "button"}
      isDisabled={isDisabled ?? false}
      className="w-full bg-teal-500 hover:bg-teal-600 text-white transition-all duration-300 hover:translate-y-[-2px]"
    >
      {text}
    </HeroButton>
  );
};
