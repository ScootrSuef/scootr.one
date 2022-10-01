import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { useQuery } from "react-query";
import Map from "../components/Map";
import { useState } from "react";

const Home: NextPage = () => {
  let [showmap, setShowmap] = useState(false);
  return (
    <>
      <Head>
        <title>scooter.one</title>
        <meta name="description" content="A One-For-All olution for scooter rental." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <button onClick={()=>{ setShowmap(() => !showmap ) }} className="btn">
        Get Location
      </button>
      {showmap && <Map />}
    </>
  );
};

export default Home;

