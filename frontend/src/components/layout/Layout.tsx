import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import Miniplayer from "./Miniplayer"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
        <Miniplayer />
      </div>
    </div>
  )
}