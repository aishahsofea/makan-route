import { Button } from "@/components/Button";
import { Input } from "@heroui/input";
import { Card } from "@heroui/card";

export const LandingPage = () => {
  return (
    <>
      {/* Logo and Title Section */}
      <div className="text-center mb-8 ">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2 mb-2">
          Makan Route
          <span role="img" aria-label="bowl">
            🍜
          </span>
        </h1>
        <p className="">
          Discover the best local makan spots along your travel route
        </p>
      </div>
      {/* Search Form */}
      <Card className="w-full max-w-md p-6 shadow-lg rounded-lg">
        <form className="space-y-4">
          <div className="flex w-full flex-col md:flex-nowrap gap-4">
            <Input
              label="Starting Point"
              placeholder="e.g. Gerik, Perak"
              variant="bordered"
              type="text"
              size="md"
            />
            <Input
              label="Destination"
              placeholder="e.g. Kota Bharu, Kelantan"
              variant="bordered"
              type="text"
              size="md"
            />
          </div>

          <Button navigateTo="/makan-spots" text={"Find makan spots"} />
        </form>
      </Card>
      {/* Footer */}
      <footer className="mt-8 text-center text-sm">
        Built with <span className="text-red-500">❤</span> for local food
        explorers
      </footer>
    </>
  );
};
