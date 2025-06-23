// // For Pages Router: pages/api/auth/[...nextauth].js
// // For App Router: app/api/auth/[...nextauth]/route.js

// import NextAuth from "next-auth";
// import GithubProvider from "next-auth/providers/github";
// // Import other providers as needed

// const authOptions = {
//     providers: [
//         GithubProvider({
//             clientId: process.env.GITHUB_ID,
//             clientSecret: process.env.GITHUB_SECRET,
//         }),
//         // Add other providers here
//     ],
//     // Additional configuration options
//     secret: process.env.NEXTAUTH_SECRET,
// };

// // Pages Router export
// export default NextAuth(authOptions);

// // App Router export
// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };