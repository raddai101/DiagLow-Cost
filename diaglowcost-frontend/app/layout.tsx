import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata={title:"DiagLow-Cost — Clinical Assistant",description:"DiagLow-Cost — Clinical Assistant",icons:{icon:"/icon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body>{children}</body></html>}