"use client";
import { useState, useMemo } from "react";
import styles from "./page.module.css";
import dynamic from "next/dynamic";
import europeData from "../static/europe.json";
import { Resort, LoadingMap } from "../components/Map";

export default function Home() {
  const ResortsMap = useMemo(
    () =>
      dynamic(() => import("../components/Map").then((mod) => mod.ResortsMap), {
        loading: () => <LoadingMap />,
        ssr: false,
      }),
    []
  );

  const getInitialResorts = (): Resort[] => {
    const allResorts = europeData.flatMap((country) => country.resorts);
    return allResorts;
  };

  const [resorts, setResorts] = useState<Resort[]>(getInitialResorts);

  const filterOpenResorts = () => {
    setResorts(resorts.filter((res) => res?.piste?.includes("snow")));
  };
  const resetResorts = () => {
    setResorts(getInitialResorts());
  };

  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Ski / Snowboard resorts in Europe</h1>
        <div className={styles.infoRow}>
          <div className={styles.filters}>
            <button
              className={styles.button}
              onClick={() => filterOpenResorts()}
            >
              Show Open
            </button>
            <button className={styles.button} onClick={() => resetResorts()}>
              Show All
            </button>
          </div>

          <div className={styles.labels}>
            <div className={styles.label}>
              <div className={styles.openSquare} />
              <div className={styles.labelName}>Open</div>
            </div>
            <div className={styles.label}>
              <div className={styles.openSoonSquare} />
              <div className={styles.labelName}>Opens Soon</div>
            </div>
            <div className={styles.label}>
              <div className={styles.closedSquare} />
              <div className={styles.labelName}>Closed</div>
            </div>
          </div>
        </div>

        <ResortsMap resorts={resorts} />

        <div className={styles.lastUpdated}>Last updated: 17/11/23</div>
      </div>
    </main>
  );
}
