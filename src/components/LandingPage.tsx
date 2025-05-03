import { Button } from "@/components/Button";
import { Input } from "@heroui/input";
import { Card } from "@heroui/card";
import Form from "next/form";
import { SearchPlaceInput } from "@/components/SearchPlaceInput";

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
        <p>Discover the best local makan spots along your travel route</p>
      </div>
      {/* Search Form */}
      <Card className="w-full max-w-md p-6 shadow-lg rounded-lg">
        <Form action="/makan-spots" className="space-y-4">
          <div className="flex w-full flex-col md:flex-nowrap gap-4">
            <SearchPlaceInput name="starting-point" label="Starting Point" />
            <SearchPlaceInput name="destination" label="Destination" />
          </div>

          <Button type="submit" text="Find makan spots" />
        </Form>
      </Card>
      {/* Footer */}
      <footer className="mt-8 text-center text-sm">
        Built with <span className="text-red-500">❤</span> for local food
        explorers
      </footer>
    </>
  );
};
