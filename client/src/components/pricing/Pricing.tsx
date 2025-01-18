import React from "react";
import { PricingCard, PricingDetail } from "./PricingCard";
import { Cover } from "../common/ui/Cover";
function Pricing() {
  return (
    <div className=" bg-black h-screen p-5">
      <h1 className="text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center  relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white">
        Build Amazing UI <br /> at <Cover>warp speed</Cover>
      </h1>
      <div>
        {/* <h1 className=" text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl  text-center  relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white"> Explore Pricing</h1> */}
      </div>
      <div className=" flex  items-center justify-center gap-9">
        {PricingDetail.map((price) => (
          <PricingCard
            price={price.price}
            features={price.includes}
            plainType={price.plan}
          />
        ))}
      </div>
    </div>
  );
}

export default Pricing;
