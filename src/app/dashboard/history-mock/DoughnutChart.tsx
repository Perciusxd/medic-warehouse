"use client"; // ถ้าใช้ใน Next.js 13+ และใช้ app router

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Button } from "@/components/ui/button"

const DoughnutChart = () => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart | null>(null);
    
    const xValues = ["แจ้งแบ่งปัน", "รอยืนยันให้ยืม", "รอส่งมอบ", "รอรับคืน", "เสร็จสิ้น"];
    const yValues = [1, 1, 2, 7, 1];
    const summary = yValues.reduce((acc, val) => acc + val, 0);
    const barColors = [
      "#b91d47",
      "#00aba9",
      "#2b5797",
      "#e8c3b9",
      "#1e7145",
    ];

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = new Chart(chartRef.current, {
        type: "doughnut",
        data: {
          labels: xValues,
          datasets: [
            {
              backgroundColor: barColors,
              data: yValues,
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              display: false, 
            },
          },
        },
      });
    }

    // Cleanup chart on component unmount
    return () => {
      chartInstance.current?.destroy();
    };
  }, [xValues, yValues]);

  return (
        <div className="flex flex-col w-full m-[20px]">
            <div className="max-w-[300px] mx-auto">
                <canvas ref={chartRef}></canvas>
            </div>
        
            <div className="flex flex-wrap justify-center gap-4 mt-4">
                {xValues.map((label, i) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                    <div
                    style={{
                        width: "16px",
                        height: "16px",
                        backgroundColor: barColors[i],
                        borderRadius: "50%",
                    }}
                    />
                    <span>{label} ({yValues[i]})</span>
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
