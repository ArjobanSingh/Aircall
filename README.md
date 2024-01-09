# React + Vite

This app is also hosted on: https://aircall-task.netlify.app/?tab=Archived

To run this project locally:
1. Clone this repository
2. `cd` into the directory and run `npm i` to install all the dependencies.
3. In your terminal run `npm run dev` command, and it will start this project on `localhost:5173`

## The tech stack
1. [React](https://react.dev/) is used as the library
2. [Tailwindcss](https://tailwindcss.com/) and [shadcn](https://ui.shadcn.com/) is used as styling and component library respectively.
3. [React-router-dom](https://reactrouter.com/en/main) is used for route management.
4. [@tanstack/react-query](https://tanstack.com/query/latest/docs/react/overview) is used for api management and caching solution.
5. [dayjs](https://day.js.org/) for handling date functions.

## App features
1. This app has two main screens. The first screen has a list of calls divided into two tabs. `Active` and `Archived` calls.
2. The other screen is the call details screen, showing the details of the single screen.
3. It has functionalities to update the archived state of each call. Users can also unarchive all calls in a single action.

## Feature not implemented with reasoning
Note: I deliberately didn't add the Archive All button, for the following reasons.
1. There is no Archive all API present.
2. If we try to use the brute force approach of hitting multiple API requests in parallel it can have the following two issues:
    1. We can hit the rate limit for the API request in brute force approach.
    2. If some API requests passed while others failed, we would have a mixed result set of archived + un-archived calls, which is a bug, and not what the user expects as the user requested to archive all.
