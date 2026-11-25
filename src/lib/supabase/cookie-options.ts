// How the sign-in cookies are stored. Scripts in the page can't read them
// (httpOnly), because signing in and out happens on the server.

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
} as const;
