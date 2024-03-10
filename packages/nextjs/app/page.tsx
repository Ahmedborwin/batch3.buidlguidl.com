"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { usePublicClient } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContractRead, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const [checkedInBuilders, setCheckedInBuilders] = useState<string[]>([]);
  const [isConnectedOptimism, setIsConnectedOptimism] = useState<boolean>(false);

  //HOOKS

  const { chain } = usePublicClient();

  //Get tally of Checkedin Builders
  const { isLoading, data: checkedInCounter } = useScaffoldContractRead({
    contractName: "BatchRegistry",
    functionName: "checkedInCounter",
  });

  //event history
  const { isLoading: isReadingEventLoading, data: eventHistory } = useScaffoldEventHistory({
    contractName: "BatchRegistry",
    eventName: "CheckedIn",
    fromBlock: 116978463n,
    watch: true,
    enabled: isConnectedOptimism,
  });

  function checkedInCounterElement() {
    if (!isLoading) {
      return checkedInCounter?.toString();
    } else {
      return <span className="loading loading-dots loading-xs"></span>;
    }
  }

  //format address for smaller screen size
  function formatAddress(address: string) {
    if (!address) {
      return "Resolving...";
    }
    return `${address.substring(0, 5)}...${address.substring(address.length - 4)}`;
  }

  //creates a list of checked in builders addresses from the event history of the contract
  //uses Set to make sure there are no duplicated on re-render
  useEffect(() => {
    if (!isReadingEventLoading && eventHistory && isConnectedOptimism) {
      const currentBuildersSet = new Set(checkedInBuilders);
      const builders = eventHistory
        .map(e => e.args.builder)
        .filter(builder => builder !== undefined && !currentBuildersSet.has(builder)) as string[];
      if (builders.length > 0) {
        setCheckedInBuilders(currentBuilders => [...currentBuilders, ...builders]);
      }
    }
  }, [isReadingEventLoading, eventHistory, checkedInBuilders, isConnectedOptimism]);

  //get chain ID and check if connected to optimism
  useEffect(() => {
    if (chain.id === 10) {
      setIsConnectedOptimism(true);
    }
  }, [chain]);

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Batch 3</span>
          </h1>
          <p className="text-center text-lg">Get started by taking a look at your batch GitHub repository.</p>
          <p className="text-lg flex gap-2 justify-center">
            <span className="font-bold">Checked in builders count:</span>
            <span>{checkedInCounterElement()}</span>
          </p>
          <div className="flex flex-col text-center text-md">
            <div>
              {!isConnectedOptimism ? (
                <div className="mt-4 text-xl font-bold"> Please Connect to Optimism To Read List of Builders </div>
              ) : (
                <>
                  <span className="font-extrabold text-lg">List of Builers</span>
                  {isReadingEventLoading ? (
                    <span className="loading loading-dots loading-xs"></span>
                  ) : (
                    <table className="table-auto mt-4">
                      <thead className=" border-b-2">
                        <tr>
                          <th>Address</th>
                          <th>ENS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {checkedInBuilders.map((builder, index) => (
                          <tr key={index}>
                            <td className="border p-2">
                              <span className="hidden sm:inline">{builder}</span>
                              <span className="inline sm:hidden">{formatAddress(builder)}</span>
                            </td>
                            <td className="border p-2">
                              <span>
                                <Address address={builder} />
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contract
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
