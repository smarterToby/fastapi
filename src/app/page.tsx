"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEffect, useState } from "react";
import { Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

const WORKERS_URL = "https://fastapi.tobiasreuss.workers.dev";

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [prevInput, setPrevInput] = useState<string>(".");
  const [searchResults, setSearchResults] = useState<{
    results: string[];
    duration: number;
  }>();
  const [chartData, setChartData] = useState<{ Speed: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const trimmedInput = input.trim();

      if (!trimmedInput || trimmedInput === prevInput) {
        return;
      }

      try {
        const res = await fetch(
          `${WORKERS_URL}/api/search?q=${encodeURIComponent(trimmedInput)}`
        );
        const data = await res?.json();

        if (data) {
          setSearchResults(data);
          setPrevInput(trimmedInput);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [input, prevInput]);

  useEffect(() => {
    if (
      searchResults &&
      searchResults.duration !== chartData.slice(-1)[0]?.Speed
    ) {
      setChartData([...chartData, { Speed: searchResults.duration }]);
    }
  }, [searchResults, chartData]);

  return (
    <main className="h-screen w-screen grainy">
      <div className="flex flex-col gap-6 items-center pt-32 duration-500 animate-in animate fade-in-5 slide-in-from-bottom-2.5">
        <h1 className="text-5xl tracking-tight font-bold">SpeedSearch⚡</h1>
        <p className="text-zink-600 text-lg max-w-prose text-center">
          A high-perfomance API built with Hono, Next.js and Cloudflare.
          <br /> Type a query below and get your results in miliseconds.
        </p>

        <div className="max-w-md w-full">
          <Command>
            <CommandInput
              value={input}
              onValueChange={setInput}
              placeholder="Search countries..."
              className="placeholder:text-zinc-500"
            />
            <CommandList>
              {searchResults?.results.length === 0 ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : null}

              {searchResults?.results && (
                <CommandGroup heading="Results">
                  {searchResults?.results.map((result) => (
                    <CommandItem
                      key={result}
                      value={result}
                      onSelect={setInput}
                    >
                      {result}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {searchResults?.results && (
                <>
                  <div className="h-px w-full bg-zinc-200" />
                  <p className="p-2 text-xs text-zinc-500">
                    Found {searchResults.results.length} results in{" "}
                    {searchResults.duration.toFixed(0)}ms
                  </p>
                </>
              )}
            </CommandList>
          </Command>
        </div>
        {chartData.length !== 0 && (
          <div>
            <div className="h-px w-full bg-zinc-200 mb-2" />
            <p className="text-zink-600 text-lg max-w-prose text-center font-semibold">
              Speed of your requests:
            </p>
            <LineChart
              width={600}
              height={335}
              data={chartData}
              margin={{ top: 50, right: 30, left: 20, bottom: 40 }}
            >
              <Line
                type="monotone"
                className=""
                dataKey="Speed"
                stroke="#0f172a"
              />
              <XAxis
                stroke="#18181b"
                name="ms"
                label={{
                  value: "Seiten",
                  position: "insideBottom",
                  offset: 0,
                  dy: 10,
                }}
              />
              <YAxis
                stroke="#18181b"
                label={{
                  value: "ms",
                  angle: -90,
                  position: "outsideLeft",
                  dx: -10,
                }}
              />
              <Tooltip />
            </LineChart>
          </div>
        )}
      </div>
    </main>
  );
}
