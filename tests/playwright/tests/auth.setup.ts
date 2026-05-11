import fs from "node:fs";
import { test as setup } from "@playwright/test";

////////////////////////////////////////
// Authentication for Assignment 2
// Delete the code block below if you are not using it
////////////////////////////////////////

// setup(
//   "authenticate assignment 2",
//   { tag: "@a2" },
//   async ({ page, playwright }) => {
//     const authFile = ".auth/user.json";
//     const content = {
//       cookies: [
//         {
//           name: "auth_token",
//           value: "123",
//           domain: "localhost",
//           secure: false,
//           expires: -1,
//           path: "/",
//           httpOnly: false,
//           sameSite: "Lax",
//         },
//       ],
//     };
//     fs.writeFileSync(authFile, JSON.stringify(content, null, 2));
//   },
// );

////////////////////////////////////////////////////////
// Authentication for Assignment 3
// Uncomment once you start working on the assignment 3
////////////////////////////////////////////////////////

setup(
  "authenticate assignment 3",
  { tag: "@a3" },
  async ({ playwright }) => {
    const authFile = ".auth/user.json";

    const apiContext = await playwright.request.newContext({
      baseURL: "http://localhost:3002",
    });

    const response = await apiContext.post("/api/auth", {
      data: JSON.stringify({ password: "123" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok()) {
      throw new Error(`Auth setup failed with status ${response.status()}`);
    }

    const storageState = await apiContext.storageState();
    const normalizedState = {
      ...storageState,
      cookies: storageState.cookies.map((cookie) => {
        if (cookie.domain === "127.0.0.1") {
          return {
            ...cookie,
            domain: "localhost",
          };
        }

        return cookie;
      }),
    };

    fs.writeFileSync(authFile, JSON.stringify(normalizedState, null, 2));
    await apiContext.dispose();
  },
);
