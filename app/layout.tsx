import type { Metadata } from "next";
import { Anton } from "next/font/google";
import "./globals.css";
import { Provider } from "./utils/providers/Provider";

import { WalletComp } from "./components/wallet/walletComp";

import { FileViewer } from "./components/FileViewer";


// const anton = Anton({
//   variable: "--font-anton",
//   subsets: ["latin"],
//   weight: ["400"],
// });

export const metadata: Metadata = {
  title: "PayVault",
  description: "Earn money by monetizing your content using our Vault Links",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` antialiased text-black `}
        suppressHydrationWarning={true}
      >
        <Provider>
          <WalletComp/>
          {children}
          <FileViewer />
        </Provider>
      </body>
    </html>
  );
}
