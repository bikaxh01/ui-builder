import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useCallback, useState } from "react";
import axios from "axios";
import { BASEURL } from "../landing/Input";
import { useAuth } from "@clerk/clerk-react";
import { redirect } from "react-router";
import { toast } from "sonner";

export const PricingDetail = [
  {
    plan: "Basic",
    price: "2000",
    includes: ["Get 1000 Credits", "Get Premium Badge"],
  },
  {
    plan: "Standard",
    price: "5000",
    includes: [
      "Get 5000 Credits",
      "Get Premium Badge",
      "Get access to multi model LLM",
      "Get access to premium community",
    ],
  },
  {
    plan: "Premium",
    price: "8000",
    includes: [
      "Get 10000 Credits",
      "Get Premium Badge",
      "Get access to multi model LLM",
      "Get access to premium community",
      "many more",
    ],
  },
];

export function PricingCard({
  plainType,
  features,
  price,
}: {
  plainType: string;
  features: string[];
  price: string;
}) {
  const [loading, setLoading] = useState(false);
  const { userId } = useAuth();

  const handleSubmit = async () => {
    if (!useAuth) return toast.error("Sign in please");

    try {
      setLoading(true);
      const response = await axios.post(`${BASEURL}create-payment`, {
        userId: userId,
        planType: plainType.toUpperCase(),
      });

      const url = await response.data.url;
      window.location.href = url;
    } catch (error) {
      toast.info("something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-xs w-full group/card border-black-2 rounded-lg">
      <div
        className={cn(
          " cursor-pointer overflow-hidden relative card h-96  rounded-md shadow-xl  max-w-sm mx-auto backgroundImage flex flex-col justify-between p-4",
          "bg-[url(https://t3.ftcdn.net/jpg/04/15/87/76/360_F_415877698_c1VY6BMnUbNxh7Or80VDZAWng4UoGfWi.jpg)] bg-cover"
        )}
      >
        <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black opacity-60"></div>

        <div className="text content">
          <h1 className="font-bold text-xl md:text-2xl text-gray-50 relative z-10">
            {plainType}
          </h1>
          <h2 className=" mt-3 font-semibold text-sm text-gray-50 relative z-10">
            Includes :
          </h2>
          {features.map((feature) => (
            <p className="font-normal text-xs text-gray-50 relative z-10 my-4">
              {feature}
            </p>
          ))}
        </div>
        <Button
          disabled={loading}
          className=" bg-blue-500 relative z-10"
          onClick={handleSubmit}
        >
          Subscribe Now at ₹{price}
        </Button>
      </div>
    </div>
  );
}
