import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "NyayaConnect – Decentralized Pro-Bono Legal Aid",
  description: "Demo-ready MVP for pro-bono legal aid coordination",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
