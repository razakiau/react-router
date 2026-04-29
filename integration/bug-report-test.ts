import { test, expect } from "@playwright/test";
import { resolveConfig } from "vite";

import { createProject } from "./helpers/vite.js";

const js = String.raw;

async function expectConcurrentConfigResolution(...appDirectories: string[]) {
  let results = await Promise.allSettled(
    appDirectories.map((appDirectory) =>
      resolveConfig(
        {
          configFile: `${appDirectory}/vite.config.ts`,
          mode: "development",
          root: appDirectory,
        },
        "build",
      ),
    ),
  );

  let failures = results.filter((result) => result.status === "rejected");

  expect(
    failures.map((failure) => failure.reason?.stack ?? failure.reason),
  ).toEqual([]);
}

////////////////////////////////////////////////////////////////////////////////
// 👋 Hola! I'm here to help you write a great bug report pull request.
//
// You don't need to fix the bug, this is just to report one.
//
// The pull request you are submitting is supposed to fail when created, to let
// the team see the erroneous behavior, and understand what's going wrong.
//
// If you happen to have a fix as well, it will have to be applied in a subsequent
// commit to this pull request, and your now-succeeding test will have to be moved
// to the appropriate file.
//
// First, make sure to install dependencies and build React Router. From the root of
// the project, run this:
//
//    ```
//    pnpm install && pnpm build
//    ```
//
// If you have never installed playwright on your system before, you may also need
// to install a browser engine:
//
//    ```
//    pnpm exec playwright install chromium
//    ```
//
// Now try running this test:
//
//    ```
//    pnpm test:integration bug-report --project chromium
//    ```
//
// You can add `--watch` to the end to have it re-run on file changes:
//
//    ```
//    pnpm test:integration bug-report --project chromium --watch
//    ```
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// 💿 Almost done, now write your failing test case(s) down here Make sure to
// add a good description for what you expect React Router to do 👇🏽
////////////////////////////////////////////////////////////////////////////////

test("keeps route config isolated when multiple apps mix manual routes and flatRoutes", async () => {
  let appA = await createProject({
    "app/routes.ts": js`
      import { route, type RouteConfig } from "@react-router/dev/routes";

      export default [route("login", "./routes/login.tsx")] satisfies RouteConfig;
    `,
    "app/routes/login.tsx": js`
      export default function Login() {
        return <h1>Login</h1>;
      }
    `,
  });

  let appB = await createProject({
    "app/routes.ts": js`
      import { type RouteConfig } from "@react-router/dev/routes";
      import { flatRoutes } from "@react-router/fs-routes";

      await new Promise((resolve) => setTimeout(resolve, 25));

      export default flatRoutes() satisfies RouteConfig;
    `,
    "app/routes/dashboard.tsx": js`
      export default function Dashboard() {
        return <h1>Dashboard</h1>;
      }
    `,
  });

  let appC = await createProject({
    "app/routes.ts": js`
      import { type RouteConfig } from "@react-router/dev/routes";
      import { flatRoutes } from "@react-router/fs-routes";

      await new Promise((resolve) => setTimeout(resolve, 50));

      export default flatRoutes() satisfies RouteConfig;
    `,
    "app/routes/settings.tsx": js`
      export default function Settings() {
        return <h1>Settings</h1>;
      }
    `,
  });

  await expectConcurrentConfigResolution(appC, appB, appA);
});

test("keeps route config isolated when multiple apps all use flatRoutes", async () => {
  let appA = await createProject({
    "app/routes.ts": js`
      import { type RouteConfig } from "@react-router/dev/routes";
      import { flatRoutes } from "@react-router/fs-routes";

      export default flatRoutes() satisfies RouteConfig;
    `,
    "app/routes/login.tsx": js`
      export default function Login() {
        return <h1>Login</h1>;
      }
    `,
  });

  let appB = await createProject({
    "app/routes.ts": js`
      import { type RouteConfig } from "@react-router/dev/routes";
      import { flatRoutes } from "@react-router/fs-routes";

      await new Promise((resolve) => setTimeout(resolve, 25));

      export default flatRoutes() satisfies RouteConfig;
    `,
    "app/routes/dashboard.tsx": js`
      export default function Dashboard() {
        return <h1>Dashboard</h1>;
      }
    `,
  });

  let appC = await createProject({
    "app/routes.ts": js`
      import { type RouteConfig } from "@react-router/dev/routes";
      import { flatRoutes } from "@react-router/fs-routes";

      await new Promise((resolve) => setTimeout(resolve, 50));

      export default flatRoutes() satisfies RouteConfig;
    `,
    "app/routes/settings.tsx": js`
      export default function Settings() {
        return <h1>Settings</h1>;
      }
    `,
  });

  await expectConcurrentConfigResolution(appC, appB, appA);
});

////////////////////////////////////////////////////////////////////////////////
// 💿 Finally, push your changes to your fork of React Router
// and open a pull request!
////////////////////////////////////////////////////////////////////////////////
