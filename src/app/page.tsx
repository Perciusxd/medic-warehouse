"use client";
import Image from "next/image";

export default function Home() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="container mx-auto px-5">
        <div className="flex flex-col md:flex-row items-center justify-center gap-10">
          <div className="w-full justify-center md:flex">
            <Image src="/hospital.png" alt="logo" width={400} height={400} />
          </div>
          <div className="w-full">
            <h1 className="mb-5 dark:text-dark font-bold text-3xl">Login</h1>
            <form className="max-w-sm">
              <div className="mb-5">
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-white dark:text-gray-900">
                  Username
                </label>
                <input type="text" id="username" readOnly className="bg-gray-50 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-50 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-900 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="username" value={'admin'} required />
              </div>
              <div className="mb-5">
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-white dark:text-gray-900">
                  Password
                </label>
                <input type="password" id="password" readOnly className="bg-gray-50 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-50 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-900 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="password" value={'1234'} required />
              </div>
                <button type="button" onClick={() => window.location.href = '/dashboard'} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mt-5">
                Submit
                </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
