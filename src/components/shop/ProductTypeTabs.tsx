import React from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { isKioskInterface } from "@/src/core/utils";

interface ProductTypeTabsProps {
  tab: "digital" | "physical" | "NFT" | "online";
  setTab: (tab: "digital" | "physical" | 'online') => void;
}

const ProductTypeTabs: React.FC<ProductTypeTabsProps> = ({ tab, setTab }) => {
  return (
    <>

      <Tabs value={tab} onValueChange={value => setTab(value as any)} className="mb-6 bg-transparent">
        <TabsList className="bg-transparent gap-x-2">
          <TabsTrigger
            value="physical"
            className="data-[state=active]:!bg-[var(--color-primary-700)] data-[state=active]:text-white text-white hover:bg-[var(--color-primary-700)]/60 hover:text-white transition-all duration-200"
          >
            Online
          </TabsTrigger>
          <TabsTrigger
            value="digital"
            className="data-[state=active]:!bg-[var(--color-primary-700)] data-[state=active]:text-white text-white hover:bg-[var(--color-primary-700)]/60 hover:text-white transition-all duration-200"
          >
            Digital
          </TabsTrigger>
          {
            isKioskInterface() && (
              <TabsTrigger
                value="online"
                className="data-[state=active]:!bg-[var(--color-primary-700)] data-[state=active]:text-white text-white hover:bg-[var(--color-primary-700)]/60 hover:text-white transition-all duration-200"
              >
                Physial
              </TabsTrigger>
            )
          }
        </TabsList>
      </Tabs>
    </>


  );
};

export default ProductTypeTabs;