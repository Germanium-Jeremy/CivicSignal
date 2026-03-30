import type { Metadata } from "next";
import localFont from "next/font/local";
import 'leaflet/dist/leaflet.css';
import "./globals.css";

const garamond = localFont({
  src: [
    {
      path: "../../public/EB_Garamond/EBGaramond-VariableFont_wght.ttf",
      weight: "400 800",
      style: "normal",
    },
    {
      path: "../../public/EB_Garamond/EBGaramond-Italic-VariableFont_wght.ttf",
      weight: "400 800",
      style: "italic",
    },
  ],
  variable: "--font-eb-garamond",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CivicSignal",
  description: "Public Issue Reporting",
  applicationName: "Civic Signal",
  authors: { name: "NKUNDABAGENZI Jeremie", url: "github link" },
  generator: "issue, reporting, citizens, public, civic"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
          <head>
            <link rel="shortcut icon" href="public/images/pin.png" type="image/x-icon" /> 
          </head>
          <body className={`${garamond.variable} antialiased`}>
              {children}
          </body>
        </html>
    );
}
