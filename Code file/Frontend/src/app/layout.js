import "./globals.css";

export const metadata = {
  title: "Smart Logistics Dashboard",
  description: "Autonomous Sustainability & Smart Logistics System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}