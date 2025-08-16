"use client"; // ถ้าใช้ใน Next.js 13+ และใช้ app router

import { useCallback, useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";
import { Button } from "@/components/ui/button"

interface DoughnutChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      hoverOffset?: number;
    }[];
  };
  options?: any;
  query?: any;
}



const DoughnutChart = ({ data, options, query }: DoughnutChartProps) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart | null>(null);

    const xValues = useMemo(() => ["แจ้งแบ่งปัน", "รอยืนยันให้ยืม", "รอส่งมอบ", "รอรับคืน", "เสร็จสิ้น"], []);
    const yValues = useMemo(() => [1, 1, 2, 7, 1], []);
    const summary = useMemo(() => data.datasets[0].data.reduce((acc, val) => acc + val, 0), [data.datasets]);
    const barColors = useMemo(() => [
      "#b91d47",
      "#00aba9",
      "#2b5797",
      "#e8c3b9",
      "#1e7145",
    ], []);

  const onQuery = useCallback((label: string) => {
    query(label);
  }, [query]);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = new Chart(chartRef.current, {
        type: "doughnut",
        data: {
          labels: data.labels || xValues,
          datasets: [
            {
              backgroundColor: data.datasets[0].backgroundColor || barColors,
              // data: yValues,
              data: data.datasets[0].data,
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              display: false, 
            },
          },
          onClick: (event: any, elements: any) => {
            if (elements && elements.length > 0) {
              
            const chart = elements[0];
            const label = data.labels[chart.index];
            if (label) {
              onQuery(label);
            }
            }
          },
        },
      });
    }

    // Cleanup chart on component unmount
    return () => {
      chartInstance.current?.destroy();
    };
  }, [xValues, yValues, barColors, data.datasets, data.labels, onQuery]);

  return (
        <div className="flex flex-col w-full m-[20px]">
            <div className="max-w-[300px] mx-auto">
                <canvas ref={chartRef}></canvas>
            </div>
        
            <div className="flex flex-wrap justify-center gap-4 mt-4">
                {data.datasets[0].data.map((label, i) => (                  
                <div key={i} className="flex items-center gap-2 text-sm">
                    <div
                    style={{
                        width: "16px",
                        height: "16px",
                        backgroundColor: data.datasets[0].backgroundColor[i],
                        borderRadius: "50%",
                    }}
                    />
                    <span>{data.labels[i]} ({data.datasets[0].data[i]})</span>
                </div>
                ))
                }
                
            </div>
            <div className="flex justify-center mt-4">
                <h1>จำนวนรายการทั้งสิ้น {summary} รายการ</h1>
            </div>
            
        </div>
    
    ); 
};

export default DoughnutChart;
