import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "ImpactChain",
  description: "A transparent, AI-verified, decentralized problem-reporting platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <div style={{ flex: 1 }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
