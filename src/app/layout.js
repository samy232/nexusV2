import "./globals.css";

export const metadata = {
  title: "Nexus | Professional Trading Platform",
  description: "Experience the next generation of asset trading with Nexus.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
